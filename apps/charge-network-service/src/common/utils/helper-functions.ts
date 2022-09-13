export const decimal = (dec) => {
    let value = 1
    for (let index = 0; index < dec; index++) {
        value *= 10
    }
    return value
}