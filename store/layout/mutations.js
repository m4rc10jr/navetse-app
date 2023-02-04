import base from './state'

export default {
  update_drawer(state, minimized) {
    state.dashboard.minimized = minimized;
    state.time = new Date();
  },

  update_notification(state, data) {
    const icons = {
      info: 'mdi-information',
      error: 'mdi-alert-circle',
      success: 'mdi-check-circle',
      warning: 'mdi-alert'
    };

    if (icons[data.color]) {
      data.icon = icons[data.color];
    }

    Object.assign(state.notification, data);
  },

  flush(state) {
    state.loaded = false;
    state.loading = false;
  },

  resetNotification(state) {
    state.notification = {...base().notification}
  }
}
