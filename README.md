# Lista de Tarefas

Aplicacao web simples para cadastro e organizacao de tarefas, desenvolvida para o Teste Inicial de Programacao.

## Funcionalidades

- Adicionar tarefa com titulo, descricao, data prevista e status.
- Listar todas as tarefas cadastradas.
- Editar tarefa existente.
- Excluir tarefa com confirmacao.
- Pesquisar tarefas por titulo, descricao, data ou status.
- Validar titulo obrigatorio.
- Validar data prevista obrigatoria e valida.
- Persistir os dados no `localStorage` do navegador.

## Tecnologias

- HTML5
- CSS3
- JavaScript puro
- `localStorage` para persistencia local
- Vercel para deploy estatico

## Como rodar

Abra o arquivo `index.html` no navegador.

Tambem e possivel servir a pasta com qualquer servidor estatico, por exemplo:

```bash
python -m http.server 3000
```

Depois acesse `http://localhost:3000`.

## Estrutura

```text
.
+-- index.html
+-- styles.css
+-- app.js
+-- README.md
+-- RELATO.md
```

## Decisoes tecnicas

A solucao foi feita sem framework para reduzir dependencias, facilitar a avaliacao do codigo e permitir deploy simples como site estatico. A persistencia em `localStorage` mantem a aplicacao funcional sem necessidade de backend ou banco de dados externo, o que atende ao escopo do teste de forma objetiva.
