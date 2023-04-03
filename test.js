for (let i = 0; i < 5; i++) {
    const log = i => [1, 0, -1, 0][i % 4];
    console.log(i, log(i), log(i + 3));
}