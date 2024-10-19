let express = require("express");
let router = express.Router();

router.get("/auth/error", (request, response) => {
  let Error = {
    typeName: request.session.typeName ? request.session.typeName : null,
    statusCode: request.session.statuscode ? request.session.statuscode : null,
    time: new Date().toUTCString(),
  };

  request.session.typeName = null
  request.session.statuscode = null
  response.status(200).json(Error).end()
});

module.exports = router;


