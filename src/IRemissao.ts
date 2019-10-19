import IIdentificadorNorma from './IIdentificadorNorma';

export default interface IRemissao {
    texto: string;
    identificador: IIdentificadorNorma;
    referencias: IReferencia[];
}

export interface IReferenciaArtigo {
    idx: number;
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

// tslint:disable-next-line: max-line-length
export type IReferencia = IReferenciaArtigo | IReferenciaParagrafo | IReferenciaInciso | IReferenciaAlinea | IReferenciaItem;
