import ModuleLibrary from "../index";

test("Should register all components when installed", () => {
  const component = jest.fn();
  const Vue = { component };

  ModuleLibrary.install(Vue);

  // Test if a particular component was registered
  expect(component).toBeCalledWith("field-object", expect.any(Object));

  // Test how many times component got registered
  const totalOfComponents = 1;
  expect(component).toHaveBeenCalledTimes(totalOfComponents);
});
