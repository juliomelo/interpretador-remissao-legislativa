export enum TipoReferencia {
    ARTIGO = 'artigo',
    CAPUT = 'caput',
    INCISO = 'inciso',
    ALINEA = 'alinea',
    ITEM = 'item',
    PARAGRAFO = 'paragrafo',
    TITULO = 'titulo',
    CAPITULO = 'capitulo',
    SECAO = 'secao',
    SUBSECAO = 'subsecao',
    PREAMBULO = 'preambulo'
}

export type TiposReferencia =
    TipoReferencia.ARTIGO |
    TipoReferencia.CAPUT |
    TipoReferencia.INCISO |
    TipoReferencia.ALINEA |
    TipoReferencia.ITEM |
    TipoReferencia.PARAGRAFO |
    TipoReferencia.TITULO |
    TipoReferencia.CAPITULO |
    TipoReferencia.SECAO |
    TipoReferencia.SUBSECAO |
    TipoReferencia.PREAMBULO;
