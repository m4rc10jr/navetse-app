export default () => ({
  loaded: false,

  time: null,

  notification: {
    model: false,
    message: null,
    color: 'error',
    top: true,
    right: true,
    shaped: false,
    multiLine: true,
    timeout: 2000,
    icon: false,
  },

  dashboard: {
    minimized: false,
  }
})
