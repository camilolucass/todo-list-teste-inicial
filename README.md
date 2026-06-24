# Lista de Tarefas — Teste Inicial de Programação

Aplicação web de lista de tarefas desenvolvida para o Teste Inicial de Programação. O objetivo do projeto é permitir o cadastro, gerenciamento e acompanhamento de tarefas de forma simples, funcional e acessível pelo navegador.

## Acesso ao projeto

Aplicação online: https://todo-list-teste-inicial.vercel.app/

Repositório: https://github.com/camilolucass/todo-list-teste-inicial/

## Funcionalidades

* Adicionar tarefa com título, descrição, data prevista e status.
* Listar tarefas cadastradas.
* Editar tarefa existente.
* Excluir tarefa com confirmação.
* Pesquisar tarefas por título, descrição, data ou status.
* Filtrar tarefas por status.
* Visualizar tarefas em formato de lista e calendário.
* Validar título obrigatório.
* Validar data prevista obrigatória e válida.
* Persistir os dados no `localStorage` do navegador.
* Abrir tarefa no Google Calendar com link pré-preenchido.
* Baixar arquivo `.ics` para importar em Google Calendar, Outlook, Apple Calendar e outros calendários compatíveis.

## Tecnologias utilizadas

* Next.js
* React
* TypeScript
* CSS
* Lucide React
* localStorage
* Vercel

## Como executar o projeto localmente

Clone o repositório:

```bash
git clone https://github.com/camilolucass/todo-list-teste-inicial.git
```

Acesse a pasta do projeto:

```bash
cd todo-list-teste-inicial
```

Instale as dependências:

```bash
npm install
```

Execute o projeto:

```bash
npm run dev
```

Depois, acesse no navegador:

```text
http://localhost:3000
```

## Estrutura do projeto

```text
.
├── src
│   ├── app
│   ├── components
│   └── lib
├── package.json
├── README.md
└── RELATO.md
```

## Integração com agenda

A aplicação possui integração simples com calendários, sem necessidade de credenciais externas.

Foram utilizadas duas abordagens:

* Link para Google Calendar com os dados da tarefa preenchidos.
* Exportação de arquivo `.ics`, baseado no padrão iCalendar.

Uma integração direta com Google Calendar API ou Microsoft Graph Calendar API também seria possível, porém exigiria OAuth, credenciais do provedor e fluxo de autorização do usuário. Para o escopo do teste, a solução por link e exportação `.ics` atende ao objetivo sem aumentar a complexidade do projeto.

## Decisões técnicas

A aplicação foi desenvolvida com Next.js, React e TypeScript para manter uma estrutura próxima de projetos front-end modernos. A persistência foi feita com `localStorage`, permitindo que o projeto funcione diretamente no navegador, sem depender de backend, banco de dados externo ou variáveis de ambiente.

Essa decisão foi tomada para priorizar uma entrega simples, funcional e fácil de testar, mantendo foco nas funcionalidades solicitadas: cadastro, listagem, edição, exclusão, pesquisa e validação de tarefas.

## Melhorias futuras

* Implementar autenticação de usuários.
* Salvar tarefas em banco de dados.
* Criar uma API REST para gerenciamento das tarefas.
* Adicionar ordenação por data prevista.
* Melhorar a responsividade em telas menores.
* Criar testes automatizados para as principais funcionalidades.

## Relato do desenvolvimento

O relato solicitado no teste está disponível no arquivo:

[RELATO.md](./RELATO.md)

## Autor

Lucas Camilo

LinkedIn: https://www.linkedin.com/in/lucas-camilo-60aa5a2ba
