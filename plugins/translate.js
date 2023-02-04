import { get, template } from "lodash";

export default function ({ $axios, env, store, redirect, route }, inject) {
  // inject('authorize', store.getters['account/authorize']);
  const messages = {
    required: 'O campo {{ attribute }} é obrigatório.',
    minLength: 'O campo {{ attribute }} deve ter pelo menos {{ min }} caracteres.',
    maxLength: 'O campo {{ attribute }} não pode ser superior a {{ max }} caracteres.',
    email: 'O campo {{ attribute }} deve ser um endereço de e-mail válido.',
    sameAs: 'Os campos {{ attribute }} e {{ eq }} devem corresponder.',
    default: 'O {{ attribute }} não é válido.',
    gt: 'O {{ attribute }} deve ser maior que {{ gt }}.',
    gte: 'O {{ attribute }} deve ser maior ou igual a {{ gte }}.',
    lt: 'O {{ attribute }} deve ser menor que {{ lt }}.',
    lte: 'O {{ attribute }} deve ser menor ou igual a {{ lte }}.',
    between: 'O {{ attribute }} deve estar entre :min e {{ max }}.',
    digits: 'O {{ attribute }} deve ter :digits dígitos.',
    digits_between: 'O {{ attribute }} deve ter entre {{ min }} e {{ max }} dígitos.',
    unique: 'O {{ attribute }} já está em uso.',
  }

  const attributes = {
    name: 'nome',
    email: 'e-mail',
    password: 'senha',
    password_confirmation: 're-senha',
    title: 'título',
    quantity: 'quantidade',
    price: 'preço',
    description: 'descrição',
    type: 'tipo',
    status: 'status',
    cost: 'custo',
    value: 'valor',
    symbol: 'simbolo',
    end_time: 'hora de término',
    start_time: 'hora de início',
    payment_date: 'data de recebimento',
    receipt_date: 'previsão de recebimento',
    provider_id: 'envolvido',
    entity_id: 'envolvido',
    client_id: 'cliente',
    item_id: 'item',
    user_id: 'usuário',
    department_id: 'departamento',
    account_id: 'operação',
    employee_id: 'responsável'
  }

  const format = (key, options) => {
    let vars = {
      attribute: key,
      ...options
    };

    //* preparar dados para substituição
    for (let [key, value] of Object.entries(vars)) {
      if (key === "attribute" && attributes[value]) {
        //* substituir atributo pelo nome traduzido.
        vars[key] = attributes[value];
      }

      if (typeof value === "function") {
        try {
          vars[key] = value()
        } catch (e) {
          vars[key] = "--";
        }
      }
    }

    const message = get(messages, options?.type, messages.default)

    const compiled = template(message, {
      interpolate: /{{([\s\S]+?)}}/g,
    })

    return compiled(vars);
  }

  inject('validationMessage', format);
}
