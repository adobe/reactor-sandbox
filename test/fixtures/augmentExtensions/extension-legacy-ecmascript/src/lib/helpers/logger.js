module.exports = {
  log: function () {
    var args = Array.prototype.slice.call(arguments);

    console.log.apply(console, ['[legacy-extension]'].concat(args));
  }
};
