# ICR12MPU — versão melhorada

Melhorias aplicadas:

- HTML semântico e mais acessível.
- Menu mobile funcional com `aria-expanded`.
- CSS organizado com variáveis, responsividade e componentes reutilizáveis.
- JavaScript corrigido: leitura anual, formulário de contacto, login Supabase e menu mobile separados por funções.
- Área restrita preparada para Supabase.

## Atenção ao Supabase

A chave pública `anon` pode ficar no front-end, mas as permissões precisam ser protegidas no Supabase com RLS. Nunca coloque `service_role` no JavaScript público.

No `script.js`, substitua:

```js
const SUPABASE_ANON_KEY = 'COLOQUE_AQUI_A_SUA_ANON_KEY_PUBLICA';
```

pela sua anon key pública.
