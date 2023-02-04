const notify = (store) => {
  return {
    update: function (data) {
      store.commit('layout/update_notification', data)

      setTimeout(() => {
        if (!data.onComplete) {
          return;
        }

        data.onComplete();

      }, data.timeout || 1500);
    },

    close: function () {
      store.commit('layout/update_notification', { model: false })
    },

    info: function (message, options = {}) {
      const payload = {
        color: 'info',
        model: true,
        message,
        ...options
      }

      this.update(payload)
    },

    error: function (message, options = {}) {
      const payload = {
        color: 'error',
        model: true,
        message,
        ...options
      }

      this.update(payload)
    },

    success: function (message, options = {}) {
      const payload = {
        color: 'success',
        model: true,
        message,
        ...options
      }

      this.update(payload)
    }
  }
}

export default notify;
