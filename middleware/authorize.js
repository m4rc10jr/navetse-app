export default async function ({ store, route, $authorize, error }) {

  const meta = route.meta.map((key) => Object.keys(key)).flat();

  if (meta <= 0 || !meta.includes('authorize')) {
    return error({
      message: 'informe ao menos um serviço para autorizar.',
      statusCode: 400
    })
  }

  const permission = typeof route.meta.authorize === "object" ? route.meta.authorize.join("|") : route.meta.authorize;

  if (!$authorize(permission)) {

    return error({
      message: 'Não possui permissões para acessar esse recurso.',
      statusCode: 403
    })
  }
}
