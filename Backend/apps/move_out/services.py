from datetime import date, datetime
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from io import BytesIO
import re
import requests
from django.conf import settings
from openpyxl import load_workbook
from .models import MoveOutPlan

postcodes_api = getattr(
    settings,
    "postcodes_api",
    "https://api.postcodes.io",
)

ons_dataset = getattr(
    settings,
    "ons_dataset",
    "https://www.ons.gov.uk/file?uri=%2Feconomy%2Finflationandpriceindices%2Fdatasets%2Fpriceindexofprivaterentsukmonthlypricestatistics%2F25march2026%2Fpriceindexofprivaterentsukmonthlypricestatistics.xlsx",
)

police_api = "https://data.police.uk/api"
REQUEST_TIMEOUT = 15
MONEY = Decimal("0.01")

class MoveOutServiceError(Exception):
    pass

def lookup_postcode(postcode: str) -> dict:
    clean_postcode = postcode.strip().upper()

    if not clean_postcode:
        raise MoveOutServiceError("Postcode is needed")

    try:
        response = requests.get(
            f"{postcodes_api}/postcodes/{clean_postcode}",
            timeout=REQUEST_TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as exc:
        raise MoveOutServiceError("Failed to look up the postcodee") from exc

    result = data.get("result")
    if not result:
        raise MoveOutServiceError("Postcode is invalid")

    return {
        "postcode": result.get("postcode"),
        "country": result.get("country"),
        "region": result.get("region"),
        "admin_district": result.get("admin_district"),
        "area_code": result.get("codes", {}).get("admin_district"),
        "latitude": result.get("latitude"),
        "longitude": result.get("longitude"),
    }

def _normalise_text(value) -> str:
    if value is None:
        return ""
    return str(value).strip().lower()

def _parse_month_year_from_row(values) -> date | None:
    month_names = {
        "january": 1,
        "february": 2,
        "march": 3,
        "april": 4,
        "may": 5,
        "june": 6,
        "july": 7,
        "august": 8,
        "september": 9,
        "october": 10,
        "november": 11,
        "december": 12,
    }

    year_value = None
    month_value = None

    for value in values:
        if isinstance(value, datetime):
            return date(value.year, value.month, 1)

        if isinstance(value, date):
            return date(value.year, value.month, 1)

        if isinstance(value, str):
            match = re.search(
                r"(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})",
                value.strip().lower(),
            )
            if match:
                return date(int(match.group(2)), month_names[match.group(1)], 1)

    for value in values:
        if isinstance(value, int) and 2015 <= value <= 2100:
            year_value = value

        if isinstance(value, str):
            month_name = value.strip().lower()
            if month_name in month_names:
                month_value = month_names[month_name]

        if isinstance(value, int) and 1 <= value <= 12 and month_value is None:
            month_value = value

    if year_value and month_value:
        return date(year_value, month_value, 1)

    return None

def _extract_rent_candidates(values) -> list[Decimal]:
    candidates = []

    for value in values:
        if value is None:
            continue

        if isinstance(value, int) and 2015 <= value <= 2100:
            continue

        try:
            number = Decimal(str(value))
        except (InvalidOperation, TypeError):
            continue

        if number < Decimal("100"):
            continue

        if number > Decimal("10000"):
            continue

        candidates.append(number)

    return candidates


def _choose_geography_name(postcode_data: dict) -> str:
    country = postcode_data.get("country")
    region = postcode_data.get("region")

    if country == "England" and region:
        return region

    if country:
        return country

    raise MoveOutServiceError("Could not determine the geography for rent lookup.")

def _download_ons_workbook():
    try:
        response = requests.get(ons_dataset, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise MoveOutServiceError("Failed to fetch ONS rent dataset") from exc

    try:
        return load_workbook(filename=BytesIO(response.content), read_only=True, data_only=True)
    except Exception as exc:
        raise MoveOutServiceError("Could not open ONS rent dataset") from exc

def _find_latest_rent_for_geography(workbook, geography_name: str) -> Decimal | None:
    target = geography_name.strip().lower()
    best_date = None
    best_rent = None

    for sheet_name in workbook.sheetnames:
        sheet = workbook[sheet_name]

        for row in sheet.iter_rows(values_only=True):
            row_values = list(row)
            row_text = [_normalise_text(v) for v in row_values]

            if target not in row_text:
                continue

            row_date = _parse_month_year_from_row(row_values)
            rent_candidates = _extract_rent_candidates(row_values)

            if not rent_candidates:
                continue

            row_rent = max(rent_candidates)

            if best_date is None and row_date is None and best_rent is None:
                best_rent = row_rent
                continue

            if row_date is not None and (best_date is None or row_date > best_date):
                best_date = row_date
                best_rent = row_rent

    return best_rent

def get_average_rent_from_ons(postcode_data: dict) -> Decimal:
    workbook = _download_ons_workbook()

    geography_name = _choose_geography_name(postcode_data)
    rent = _find_latest_rent_for_geography(workbook, geography_name)

    if rent is None and postcode_data.get("country"):
        rent = _find_latest_rent_for_geography(workbook, postcode_data["country"])

    if rent is None:
        raise MoveOutServiceError("Could not find rent data in ONS dataset for this area.")

    return rent.quantize(MONEY, rounding=ROUND_HALF_UP)

def get_crime_level(postcode_data: dict) -> str:
    lat = postcode_data.get("latitude")
    lng = postcode_data.get("longitude")

    if lat is None or lng is None:
        return "Unknown"

    try:
        response = requests.get(
            f"{police_api}/crimes-street/all-crime",
            params={"lat": lat, "lng": lng},
            timeout=REQUEST_TIMEOUT,
        )
        response.raise_for_status()
        crimes = response.json()
    except requests.RequestException:
        return "Unknown"
    except ValueError:
        return "Unknown"

    crime_count = len(crimes)

    if crime_count < 25:
        return "Very Low"
    if crime_count < 60:
        return "Low"
    if crime_count < 110:
        return "Moderate"
    if crime_count < 180:
        return "High"
    return "Very High"

def calculate_disposable_income(monthly_income: Decimal, monthly_expenses: Decimal) -> Decimal:
    return (monthly_income - monthly_expenses).quantize(MONEY, rounding=ROUND_HALF_UP)

def calculate_rent_ratio_percent(monthly_income: Decimal, estimated_rent: Decimal) -> Decimal:
    if monthly_income <= 0:
        return Decimal("0.00")

    ratio = (estimated_rent / monthly_income) * Decimal("100")
    return ratio.quantize(MONEY, rounding=ROUND_HALF_UP)

def calculate_readiness(monthly_income: Decimal, monthly_expenses: Decimal, estimated_rent: Decimal) -> dict:
    disposable_income = calculate_disposable_income(monthly_income, monthly_expenses)
    rent_ratio_percent = calculate_rent_ratio_percent(monthly_income, estimated_rent)

    if disposable_income <= 0:
        status = MoveOutPlan.ReadinessStatus.not_ready
        score = 10
    elif disposable_income < estimated_rent:
        status = MoveOutPlan.ReadinessStatus.needs_improvement
        score = 35
    elif rent_ratio_percent <= Decimal("30.00"):
        status = MoveOutPlan.ReadinessStatus.ready
        score = 85
    else:
        status = MoveOutPlan.ReadinessStatus.borderline
        score = 60

    return {
        "disposable_income": disposable_income,
        "rent_ratio_percent": rent_ratio_percent,
        "status": status,
        "readiness_score": score,
    }

def generate_summary(
    status: str,
    estimated_rent: Decimal,
    disposable_income: Decimal,
    crime_level: str,
) -> str:
    crime_text = f" Crime level in the area appears to be {crime_level.lower()}."

    if status == MoveOutPlan.ReadinessStatus.ready:
        return (
            f"You appear ready to move out. Your remaining monthly income looks strong "
            f"compared with the estimated local rent of £{estimated_rent}."
            f"{crime_text}"
        )

    if status == MoveOutPlan.ReadinessStatus.borderline:
        return (
            f"You may be able to move out, but affordability looks tight compared with "
            f"the estimated local rent of £{estimated_rent}."
            f"{crime_text}"
        )

    if status == MoveOutPlan.ReadinessStatus.needs_improvement:
        return (
            f"Your remaining monthly income is currently below the estimated rent of "
            f"£{estimated_rent}, so moving out may be difficult right now."
            f"{crime_text}"
        )

    return (
        "You are not currently in a strong position to move out based on your income, "
        f"expenses, and the rent estimate for your area.{crime_text}"
    )

def save_move_out_plan(user, postcode: str, monthly_income, monthly_expenses) -> MoveOutPlan:
    try:
        monthly_income = Decimal(str(monthly_income))
        monthly_expenses = Decimal(str(monthly_expenses))
    except (InvalidOperation, TypeError) as exc:
        raise MoveOutServiceError("Income and expenses must be valid numbers.") from exc

    postcode_data = lookup_postcode(postcode)
    estimated_rent = get_average_rent_from_ons(postcode_data)
    crime_level = get_crime_level(postcode_data)

    readiness = calculate_readiness(
        monthly_income=monthly_income,
        monthly_expenses=monthly_expenses,
        estimated_rent=estimated_rent,
    )

    summary = generate_summary(
        status=readiness["status"],
        estimated_rent=estimated_rent,
        disposable_income=readiness["disposable_income"],
        crime_level=crime_level,
    )

    plan, _ = MoveOutPlan.objects.update_or_create(
        user=user,
        defaults={
            "target_postcode": postcode_data["postcode"],
            "area_name": postcode_data.get("admin_district") or postcode_data.get("region") or postcode_data.get("country"),
            "area_code": postcode_data.get("area_code") or "",
            "monthly_income": monthly_income,
            "monthly_expenses": monthly_expenses,
            "estimated_monthly_rent": estimated_rent,
            "disposable_income": readiness["disposable_income"],
            "rent_ratio_percent": readiness["rent_ratio_percent"],
            "readiness_score": readiness["readiness_score"],
            "status": readiness["status"],
            "summary": f"{summary} Crime level: {crime_level}.",
        },
    )

    return plan

def get_saved_move_out_plan(user):
    try:
        return user.move_out_plan
    except MoveOutPlan.DoesNotExist:
        return None