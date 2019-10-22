export default class ErroReferenciaIncompleta extends Error {
    public readonly codigo = -1;

    constructor(trecho: string, inicio: number) {
        super(`Referência incompleta para "${trecho}" em ${inicio}.`);

        console.debug(`Referência incompleta para "${trecho}" em ${inicio}.`);
    }
}
