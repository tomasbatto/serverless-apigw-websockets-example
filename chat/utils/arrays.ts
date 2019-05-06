
export const flatMap = (f: any, xs: any) => xs.reduce((acc: any,x: any) => acc.concat(f(x)), [])