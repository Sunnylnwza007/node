const axios = require("axios");

axios({
  method: "get",
  url: "https://api.github.com/emojis",
  headers: {
  },
  params: {
  },
  data: {},
})
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error);
  });
