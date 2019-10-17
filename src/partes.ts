import { TipoReferencia } from './TipoReferencia';

const partes: {
    tipo: TipoReferencia,
    expressao: string[]
}[] = [
        {
            tipo: TipoReferencia.ARTIGO,
            expressao: ['art', 'art.', 'artigo']
        },
        {
            tipo: TipoReferencia.CAPUT,
            expressao: ['caput']
        },
        {
            tipo: TipoReferencia.PARAGRAFO,
            expressao: ['parágrafo', 'paragrafo', '§', 'parág.', 'parag.']
        },
        {
            tipo: TipoReferencia.INCISO,
            expressao: ['inc', 'inc.', 'inciso']
        },
        {
            tipo: TipoReferencia.ALINEA,
            expressao: ['ali', 'ali.', 'alínea', 'alinea']
        },
        {
            tipo: TipoReferencia.ITEM,
            expressao: ['ite', 'item']
        },
        {
            tipo: TipoReferencia.SUBSECAO,
            expressao: ['subseção', 'subsecao', 'subsec', 'subsec.']
        },
        {
            tipo: TipoReferencia.SECAO,
            expressao: ['secao', 'sec.', 'sec']
        },
        {
            tipo: TipoReferencia.CAPITULO,
            expressao: ['capítulo', 'capitulo', 'cap.', 'cap']
        },
        {
            tipo: TipoReferencia.TITULO,
            expressao: ['título', 'titulo', 'tit.', 'tit']
        },
        {
            tipo: TipoReferencia.PREAMBULO,
            expressao: ['preambulo', 'preâmbulo', 'pré-âmbulo', 'pre-ambulo', 'préâmbulo', 'préambulo']
        }
    ];

export default partes;
