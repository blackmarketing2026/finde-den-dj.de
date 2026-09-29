const places = {
  berlin: [52.52, 13.405],
  hamburg: [53.551, 9.994],
  muenchen: [48.137, 11.575],
  münchen: [48.137, 11.575],
  köln: [50.938, 6.96],
  koeln: [50.938, 6.96],
  frankfurt: [50.11, 8.682],
  stuttgart: [48.775, 9.183],
  düsseldorf: [51.227, 6.774],
  duesseldorf: [51.227, 6.774],
  dortmund: [51.514, 7.466],
  essen: [51.456, 7.012],
  leipzig: [51.34, 12.374],
  bremen: [53.079, 8.801],
  dresden: [51.05, 13.738],
  hannover: [52.375, 9.732],
  nürnberg: [49.452, 11.077],
  nuernberg: [49.452, 11.077],
  duisburg: [51.434, 6.762],
  bochum: [51.481, 7.217],
  wuppertal: [51.257, 7.151],
  bielefeld: [52.03, 8.533],
  bonn: [50.737, 7.099],
  münster: [51.962, 7.626],
  karlsruhe: [49.006, 8.404],
  mannheim: [49.488, 8.466],
  augsburg: [48.37, 10.898],
  wiesbaden: [50.082, 8.241],
  mainz: [50.0, 8.272],
  freiburg: [47.999, 7.842],
  rostock: [54.092, 12.099],
  potsdam: [52.4, 13.059],
};
const postalPlaces = [
  { test: /^1[0-4]\d{3}$/, name: "berlin" },
  { test: /^2[0-2]\d{3}$/, name: "hamburg" },
  { test: /^8[01]\d{3}$/, name: "münchen" },
];
export function distanceKm(a, b) {
  const norm = (s) =>
    String(s || "")
      .trim()
      .toLocaleLowerCase("de")
      .replace(/\s+/g, " ");
  a = norm(a);
  b = norm(b);
  if (a === b) return 0;
  const locate = (s) =>
    places[s] ||
    (postalPlaces.find((x) => x.test.test(s))?.name &&
      places[postalPlaces.find((x) => x.test.test(s)).name]);
  const x = locate(a),
    y = locate(b);
  if (!x || !y) return null;
  const rad = (n) => (n * Math.PI) / 180;
  const dLat = rad(y[0] - x[0]),
    dLon = rad(y[1] - x[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(x[0])) * Math.cos(rad(y[0])) * Math.sin(dLon / 2) ** 2;
  return Math.round(6371 * 2 * Math.asin(Math.sqrt(h)));
}
