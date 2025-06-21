export const reshapeArray = (arr: number[], dimensions: number[]) => {
	// to ignore batch dimension, but ensure to keep the (1,1) attention dimension
	const filteredDimensions = dimensions.filter((dim, i) => !(i === 0 && dim == 1));

	const createNestedArray = (arr: number[], dims: number[]): any => {
		if (dims.length === 1) return arr.splice(0, dims[0]);
		const size = dims[0];
		const restDims = dims.slice(1);
		return Array.from({ length: size }, () => createNestedArray(arr, restDims));
	};

	return createNestedArray(arr, filteredDimensions);
};

export const findArrayDepth = (arr: any): number =>
	Array.isArray(arr) ? 1 + arr.reduce((max, item) => Math.max(max, findArrayDepth(item)), 0) : 0;

export const splitArray = (doubleArray: number[][], x: number) => {
	const splitArrays = doubleArray.map((subArray) => {
		const length = Math.ceil(subArray.length / x);
		return Array.from({ length: x }, (_, i) => subArray.slice(i * length, i * length + length));
	});

	return Array.from({ length: x }, (_, index) =>
		splitArrays.map((subArray) => subArray[index] || [])
	);
};

export const maskArray = (data: number[][]): number[][] => {
	return data.map((array: number[], index: number) => {
		let newArray: number[] = new Array(array.length).fill(-Infinity);
		for (let i = 0; i <= index && i < array.length; i++) {
			newArray[i] = array[i];
		}
		return newArray;
	});
};
