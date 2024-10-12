export function transformStr(str: string) : string {
	return str.toLocaleLowerCase().replaceAll(' ', '-').replaceAll(',','').replaceAll('dž', 'dz').replaceAll('č', 'c').replaceAll('ć', 'c').replaceAll('š', 's').replaceAll('ž', 'z').replaceAll('đ', 'd')
}