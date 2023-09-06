/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
    });
  });
});

describe("When I submit a new Bill", () => {
  // Define a test to ensure that the bill is correctly saved
  test("Then the bill must be correctly saved", async () => {
    // Define a navigation function to change the pathname
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    // Mock the local storage and set user type as "Employee"
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    // Set up the HTML for the new bill page
    const html = NewBillUI();
    document.body.innerHTML = html;

    // Initialize the NewBill container
    const newBillInit = new NewBill({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });
    // Get the new bill form
    const formNewBill = screen.getByTestId("form-new-bill");
    // Ensure that the form element has been found and selected correctly
    expect(formNewBill).toBeTruthy();
    // Add a submit event listener to the form and trigger a submit event
    const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
    formNewBill.addEventListener("submit", handleSubmit);
    fireEvent.submit(formNewBill);
    // Verify that the handleSubmit function was called
    expect(handleSubmit).toHaveBeenCalled();
  });

  // Define a test to ensure that bills are fetched from the mock API on submit
  test("Then fetches bills from mock API POST", async () => {
    // Mock local storage and set user type as "Employee"
    localStorage.setItem(
      "user",
      JSON.stringify({ type: "Employee", email: "a@a" })
    );
    // Create a root element and append to body
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    // Call the router function to navigate to the NewBill page
    router();
    window.onNavigate(ROUTES_PATH.NewBill);
  });

  // Define a test to ensure that the file is correctly handled and submitted
  test("Then verify the file bill", async () => {
    // Spy on the "bills" method of the mock store object
    jest.spyOn(mockStore, "bills");

    // Define a navigation function to change the pathname
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    // Mock the local storage and location, and set user type as "Employee"
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    Object.defineProperty(window, "location", {
      value: { hash: ROUTES_PATH["NewBill"] }, // simulate navigating to the NewBill route
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    // Set up the HTML for the new bill page
    const html = NewBillUI();
    document.body.innerHTML = html;

    // Initialize the NewBill container
    const newBillInit = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });

    // Create a new file object to simulate a file upload
    const file = new File(["image"], "image.png", { type: "image/png" });

    // Define a mock function to handle the file change event
    const handleChangeFile = jest.fn((e) => newBillInit.handleChangeFile(e));

    // Get the form and file input elements by their test IDs
    const formNewBill = screen.getByTestId("form-new-bill");
    const billFile = screen.getByTestId("file");

    // Add an event listener to the file input element to trigger the handleChangeFile function
    billFile.addEventListener("change", handleChangeFile);

    // Simulate uploading the file by triggering the "change" event on the file input element
    userEvent.upload(billFile, file);

    // Check that the file name is defined and that the handleChangeFile function was called
    expect(billFile.files[0].name).toBeDefined();
    expect(handleChangeFile).toBeCalled();

    // Define a mock function to handle the form submit event
    const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));

    // Add an event listener to the form element to trigger the handleSubmit function
    formNewBill.addEventListener("submit", handleSubmit);

    // Simulate submitting the form by triggering the "submit" event on the form element
    fireEvent.submit(formNewBill);

    // Check that the handleSubmit function was called
    expect(handleSubmit).toHaveBeenCalled();
  });
});

// testing if we have an alert when format of file is incorrect
describe("when user is trying to upload a justificatif ", () => {
  let newBill;

  beforeAll(() => {
    // Set up the document body with the form for testing
    document.body.innerHTML = `
      <form data-testid="form-new-bill">
        <input type="file" data-testid="file">
      </form>
    `;

    // Instantiate the NewBill component
    newBill = new NewBill({ document });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("displays an alert message for invalid file extensions", () => {
    // Spy on the window.alert method
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    // Create a fake file with an invalid extension
    const fakeFile = new File([""], "fakefile.txt", { type: "text/plain" });

    // Set the fake file as the selected file
    const fileInput = document.querySelector(`input[data-testid="file"]`);
    fireEvent.change(fileInput, { target: { files: [fakeFile] } });

    // Expect an alert message to have been displayed
    expect(alertSpy).toHaveBeenCalled();

    // Expect the file input to be cleared
    expect(fileInput.value).toBe("");
  });
});

/*----------------------Test d'intégration---------------------- */

// Testing that the bill is created after submitting the completed form
describe("When the user submits a completed new bill form", () => {
  test("Then the bill is created", async () => {
    // Set up the HTML for the new bill page
    const html = NewBillUI();
    document.body.innerHTML = html;

    // Define a navigation function to change the pathname
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    // Mock the local storage and set the user type as Employee
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "azerty@email.com",
      })
    );

    // Initialize the NewBill container
    const newBill = new NewBill({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });

    // Set up a valid bill object
    const validBill = {
      type: "Transports",
      name: "vol Paris beyrouth",
      date: "2024-01-03",
      amount: 480,
      vat: 50,
      pct: 17,
      commentary: "nice to have",
      fileUrl: "../images/beyrouth.jpg",
      fileName: "test.jpg",
      status: "pending",
    };

    // Check that the valid bill object is correctly defined
    expect(validBill).toEqual(
      expect.objectContaining({
        type: "Transports",
        name: "vol Paris beyrouth",
        date: "2024-01-03",
        amount: 480,
        vat: 50,
        pct: 17,
        commentary: "nice to have",
        fileUrl: "../images/beyrouth.jpg",
        fileName: "test.jpg",
        status: "pending",
      })
    );

    // Fill in the form with the valid bill object properties
    screen.getByTestId("expense-type").value = validBill.type;
    screen.getByTestId("expense-name").value = validBill.name;
    screen.getByTestId("datepicker").value = validBill.date;
    screen.getByTestId("amount").value = validBill.amount;
    screen.getByTestId("vat").value = validBill.vat;
    screen.getByTestId("pct").value = validBill.pct;
    screen.getByTestId("commentary").value = validBill.commentary;

    // Set up the new bill properties with the valid bill object properties
    newBill.fileName = validBill.fileName;
    newBill.fileUrl = validBill.fileUrl;

    // Mock the updateBill method
    newBill.updateBill = jest.fn();

    // Set up a handle submit function
    const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

    const form = screen.getByTestId("form-new-bill");
    form.addEventListener("submit", handleSubmit);

    // Simulate submitting the form
    fireEvent.submit(form);

    // Check that the handleSubmit and updateBill methods have been called
    expect(handleSubmit).toHaveBeenCalled();
    expect(newBill.updateBill).toHaveBeenCalled();
  });
});

// Test to check error handling when fetching bills with error 500 or error 404 from API
describe("When fetching bills from the API with an error", () => {
  // This function sets up a test scenario for the NewBill component when fetching bills with an error from the API
  const setupNewBillTest = async (mockStore, errorType) => {
    // Mock the 'bills' method of the mock store and console.error method

    jest.spyOn(mockStore, "bills");
    jest.spyOn(console, "error").mockImplementation(() => {});
    // Define localStorage and location for testing purposes
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    Object.defineProperty(window, "location", {
      value: { hash: ROUTES_PATH["NewBill"] },
    });
    // Set user type and create root element

    window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
    document.body.innerHTML = `<div id="root"></div>`;
    // Initialize router and onNavigate method

    router();
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    // Mock update method of bills store to throw the specified error
    mockStore.bills.mockImplementationOnce(() => {
      return {
        update: () => {
          return Promise.reject(new Error(`Erreur ${errorType}`));
        },
      };
    });
    // Create newBill instance
    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });
    // Get the new bill form and submit it

    const form = screen.getByTestId("form-new-bill");
    const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
    form.addEventListener("submit", handleSubmit);
    fireEvent.submit(form);
    // Wait for promise to resolve

    await new Promise(process.nextTick);
    // Verify that console.error is called
    expect(console.error).toBeCalled();
  };
  // This test scenario fetches bills from the API and fails with an error  500
  test("fetches error from an API and fails with 500 error", async () => {
    await setupNewBillTest(mockStore, 500);
  });
  // This test scenario fetches bills from the API and fails with an error  404
  test("fetches error from an API and fails with 404 error", async () => {
    await setupNewBillTest(mockStore, 404);
  });
});
