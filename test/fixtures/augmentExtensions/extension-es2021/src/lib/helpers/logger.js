module.exports = {
  log: function () {
    var args = Array.prototype.slice.call(arguments);

    console.log.apply(console, ['[es2021-extension]'].concat(args));
  }
};
