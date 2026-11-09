/**
 * Menyalin properti dari DTO ke entity, tetapi hanya untuk properti yang
 * benar-benar dikirim (bukan undefined).
 *
 * Dengan `useDefineForClassFields` (target ES2023), instance DTO hasil
 * class-transformer memiliki seluruh properti deklarasi dengan nilai
 * undefined. `Object.assign` akan menimpa kolom entity menjadi undefined,
 * sehingga perhitungan stok bisa gagal. Helper ini mencegah hal tersebut.
 */
export function assignDefined<T extends object>(target: T, source: object): T {
  for (const key of Object.keys(source)) {
    const value = (source as Record<string, unknown>)[key];
    if (value !== undefined) {
      (target as Record<string, unknown>)[key] = value;
    }
  }
  return target;
}
