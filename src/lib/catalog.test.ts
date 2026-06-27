import { describe, expect, it } from "vitest";
import { getOperationalLevel, groupByOperationalLevel } from "./catalog";

describe("operational position levels", () => {
  it.each([
    ["Director General UDN", "Planeación"],
    ["Directora Comercial", "Planeación"],
    ["Gerente Deportivo e Inteligencia", "Supervisión"],
    ["Coordinador Administrativo", "Supervisión"],
    ["Ejecutivo de Cuentas", "Supervisión"],
  ])("classifies %s as %s", (name, expected) => {
    expect(getOperationalLevel(name)).toBe(expected);
  });

  it("groups positions in planning, supervision and execution order", () => {
    const groups = groupByOperationalLevel(
      [{ name: "Analista" }, { name: "Gerente Comercial" }, { name: "Director Operativo" }],
      (item) => item.name,
    );

    expect(groups.map((group) => group.level)).toEqual(["Planeación", "Supervisión", "Ejecución"]);
  });
});
