import "@testing-library/jest-dom"

/*
    I've created this class to provide a simple mock implementation of `ResizeObserver` for Jest tests.
	jsdom does not implement this so the Test environment shim for browser APIs.

	I made this for the following issues with jsdom:
	- The frontend uses Radix-based UI primitives and layout-aware components.
	- Some of those dependencies expect `ResizeObserver` to exist at runtime.
	- Jest runs in jsdom, which does not provide a native `ResizeObserver` implementation.
	- Without this shim, component tests can fail before they even reach the assertions, typically with `ResizeObserver is not defined`.

	What this mock does:
	- Provides a constructor-shaped stand-in so code can safely instantiate it.
	- Exposes the minimal methods that browser code expects: `observe`, `unobserve`, and `disconnect`.
	- Keeps the methods as no-ops because these tests only need the API surface, not actual resize measurement behavior.

	If a test ever needs to verify real resize reactions, then this won't be applicable...
    but for now it allows our test suite to run unit tests without errors related to missing `ResizeObserver`.
*/
class ResizeObserverMock {
	observe() {}

	unobserve() {}

	disconnect() {}
}

Object.defineProperty(globalThis, "ResizeObserver", {
	configurable: true,
	writable: true,
	value: ResizeObserverMock,
})

/*
	I've created this `window.matchMedia` mock implementation for Jest tests.
	jsdom does not implement this by default, so this acts as another test environment browser API shim.

	I added this for the following issues with jsdom:
	- Some responsive hooks/components use `matchMedia` to evaluate breakpoints.
	- The sidebar/layout behavior can trigger `matchMedia` access during render/effects.
	- Jest runs in jsdom, which does not provide a native `window.matchMedia` implementation.
	- Without this shim, tests can fail early with `TypeError: window.matchMedia is not a function`.

	What this mock does:
	- Provides a function that returns a `MediaQueryList`-shaped object.
	- Includes properties/methods commonly expected by libraries: `matches`, `media`, `onchange`,
	  `addListener`, `removeListener`, `addEventListener`, `removeEventListener`, and `dispatchEvent`.
	- Keeps listeners as no-ops because these tests only need the API surface, not actual viewport simulation.

	If a test ever needs to verify true responsive behavior, then this default mock won't be enough.
	In that case, the test should override `window.matchMedia` with scenario-specific `matches` values.
*/
if (typeof window !== "undefined" && !window.matchMedia) {
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		configurable: true,
		value: (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		}),
	})
}
