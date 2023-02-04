export default {
  loading: state => state.loading,

  response: state => state.data,

  error: state => state.error,

  hasError: state => state?.data?.status >= 400,

  message: state => {
    const message = {
      400: () => ['Erro ao processar requisição', state.data?.errors[0] ?? null],
      401: () => [ state.data?.message ?? 'Não autorizado'],
      403: () => [ state.data?.message ?? 'Não possui permissões para o acesso'],
      404: () => ['Registro não encontrado'],
      422: () => state.data?.errors ?? [],
      default: () => [state.data?.message ?? 'Não foi possivel processar a requisição'],
    }

    return message[state.data?.status]?.().filter(h => h) ?? message.default();
  },
}
