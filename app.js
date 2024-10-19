/* ======================> Modules <====================== */
let express = require("express");
let app = express();
let path = require("path");
let session = require("express-session");
let hbs = require("express-handlebars");
let cookieParser = require("cookie-parser");
let hpp = require("hpp"); // prevent http parameter pollution
let toobusy = require("toobusy-js"); // prevent heavy trafic
const database = require("./config/database/connection");

/* ======================> Custom modules <====================== */
let authenticationRouter = require("./routes/authanication-router");
let adminRouter = require("./routes/admin-router");
let userRouter = require("./routes/user-router");
let userOptionRouter = require("./routes/user-options");
let globelchatRouter = require("./routes/globel-chat-router");
let apiRouter = require("./routes/api-router");

/* ======================> Other configuration <====================== */
//handlebars set-up
app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: path.join(__dirname, "/views/layout/"),
    partialsDir: path.join(__dirname, "/views/partials"),
  })
);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.json({ limit: "1kb" }));
app.use(express.urlencoded({ extended: false, limit: "1kb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(function (request, response, next) {
  if (toobusy()) {
    response.status(503).send("server to busy!");
  } else {
    next();
  }
});

app.use(hpp());
//session management
app.use(
  session({
    name: "Set-Cookie",
    secret: "dev-ctf-server",
    cookie: {
      maxAge: 259200000.0,
      sameSite: "lax",
      path: "/",
    },
  })
);

database.connect((info) => {
  console.log(info);
});

/* =====(=================> Router configuration <====================== */
app.use(authenticationRouter);
app.use("/admin", adminRouter);
app.use("/", userRouter);
app.use(userOptionRouter);
app.use("/globel-chat", globelchatRouter);
app.use(apiRouter);

app.use("*", (request, response) => {
  let user = {}
  let Success = {}
  let Error = {}
  if(request.session.user_login){
    user.login = request.session.user_login;
    user.username = request.session.username;
    user.email = request.session.email;
    user.dob = request.session.dob;
    user.role = request.session.role;
    user.createAt = request.session.createAt
  }

  if(request.session.Success){
    Success.Success = request.session.Success
    Success.SuccessMsg = request.session.SuccessMsg
    
    request.session.Success = false
    request.session.SuccessMsg = null
  }

  if(request.session.Error){
    Error.Error = request.session.Error
    Error.ErrorMsg = request.session.ErrorMsg

    request.session.Error = false
    request.session.ErrorMsg = null
  }

  response.status(404).render("error/page-not-found", {
    title: "- Not found!",
    user,
    Success,
    Error
  });
});

module.exports = app;
