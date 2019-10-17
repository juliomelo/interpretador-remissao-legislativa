import IIdentificadorNorma from './IIdentificadorNorma';

export default interface IRemissao {
    texto: string;
    identificador: IIdentificadorNorma;
    referencias: IReferenciaArtigo[];
}

export interface IReferenciaArtigo {
    texto: string;
    artigo: string;
    caput?: boolean;
}

export interface IReferenciaParagrafo extends IReferenciaArtigo {
    paragrafo: string;
}

export interface IReferenciaInciso extends IReferenciaArtigo {
    paragrafo?: string;
    inciso: string;
}

export interface IReferenciaAlinea extends IReferenciaInciso {
    alinea: string;
}

export interface IReferenciaItem extends IReferenciaAlinea {
    item: string;
}
