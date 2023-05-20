module.exports = (value) => {
  let id = value.toString();
  if (value < 10) {
    id = `000${id}`;
  } else if (value < 100) {
    id = `00${id}`;
  } else if (value < 1000) {
    id = `0${id}`;
  }
  return id;
};
