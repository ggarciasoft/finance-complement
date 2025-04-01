// Mock global objects and setup global test environment

// Mock Buffer globally if needed
if (!global.Buffer) {
  global.Buffer = {
    from: jest.fn().mockImplementation((str) => ({
      toString: jest.fn().mockReturnValue(str)
    }))
  };
}

// Mock fetch globally if needed
if (!global.fetch) {
  global.fetch = jest.fn().mockImplementation(() => 
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({})
    })
  );
}

// Add missing browser globals
global.DOMParser = jest.fn().mockImplementation(() => ({
  parseFromString: jest.fn().mockReturnValue({})
}));

// Silence console errors during tests
console.error = jest.fn(); 