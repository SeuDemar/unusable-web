# Deploy na Cloudflare

O site é 100% estático — HTML, CSS e JavaScript com caminhos relativos, sem build, sem
backend. Serve em qualquer host estático. Esta é a configuração para Cloudflare.

**Regra que vale para qualquer método:** só o conteúdo de `public/` vai para a web.
`AGENTS.md`, `docs/`, `.claude/` e `wrangler.jsonc` ficam de fora de propósito.

---

## Opção A — Workers com Git (recomendada)

Requisições a assets estáticos no Workers são **gratuitas e ilimitadas**, inclusive no
plano free, porque nenhum script Worker é invocado. Este projeto não tem código de
servidor, então o custo é zero.

O repositório já traz o `wrangler.jsonc` na raiz:

```jsonc
{
  "name": "unusable-web",
  "compatibility_date": "2026-09-07",
  "assets": {
    "directory": "./public/"
  }
}
```

Não existe campo `main` — ele só é necessário quando há código de servidor.

### Pelo painel

1. Cloudflare → **Workers & Pages** → **Create** → aba **Workers** → **Import a repository**
2. Conectar GitHub e escolher o repositório
3. Configurar:

| Campo | Valor |
|---|---|
| Worker name | `unusable-web` (tem que bater com o `name` do `wrangler.jsonc`) |
| Root directory | vazio (raiz do repo) |
| Build command | vazio |
| Deploy command | `npx wrangler deploy` |
| Branch | `main` |

> O nome do Worker no painel **precisa ser idêntico** ao `name` do `wrangler.jsonc`,
> senão o build falha.

### Pela linha de comando

```bash
npm install -D wrangler@latest
npx wrangler login
npx wrangler deploy
```

---

## Opção B — Pages com Git

1. Cloudflare → **Workers & Pages** → **Create** → aba **Pages** → **Connect to Git**
2. Autorizar GitHub e escolher o repositório
3. Configurar:

| Campo | Valor |
|---|---|
| Project name | `unusable-web` |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | **vazio** |
| Build output directory | `public` |
| Root directory | vazio |

4. **Save and Deploy**

> **Atenção:** um projeto Pages criado via Git **não pode** ser convertido para Direct
> Upload depois. A escolha é definitiva para aquele projeto.

---

## Depois de conectar

- Todo push na `main` redeploya sozinho.
- Qualquer outra branch gera um **preview deployment** com URL própria.
- Provedores suportados: **GitHub e GitLab**. Não há Bitbucket nem git genérico.

## Domínio

O deploy sai em `unusable-web.<subdominio>.workers.dev` (Workers) ou
`unusable-web.pages.dev` (Pages). Domínio próprio é configurado depois, no painel do
projeto, em Custom domains.

## Rodando local

Nada disso é necessário para desenvolver. Abrir `public/index.html` no navegador
continua funcionando, porque o jogo foi escrito para rodar em `file://`.

Se quiser servir por HTTP local:

```bash
npx wrangler dev
```
