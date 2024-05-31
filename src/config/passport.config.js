import passport from "passport";
import { Strategy } from "passport-local";
import StrategyGitHub from "passport-github2";
import { Strategy as JwtStrategy } from "passport-jwt";
import cartManager from "../dao/manager_mongo/cartsManager.js";
import jwt from "jsonwebtoken";
import config from "./config.js";
import { port } from "../commander.js";
import { userService } from "../repositories/index.js";

const cm = new cartManager();

passport.use(
  "jwt",
  new JwtStrategy(
    {
      jwtFromRequest: (req) => {
        let token = null;
        if (req && req.signedCookies) {
          token = req.signedCookies["jwt"];
        }
        return token;
      },
      secretOrKey: config.privateKey,
    },
    async (jwt_payload, done) => {
      try {
        const user = await userService.getById(jwt_payload.sub);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);
export const requireJwtAuth = passport.authenticate("jwt", { session: false });
export const generateToken = (user) => {
  let token = jwt.sign({ id: user._id }, config.privateKey, { expiresIn: "24h" });
  return token;
};

export const generateEmailToken = (email) => {
  const payload = {
    email,
    timestamp: Date.now(), // Marca de tiempo en milisegundos
  };
  return jwt.sign(payload, config.privateKey, { expiresIn: "1h" }); // Expira en 10 segundos
};

export const verifyEmailToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.privateKey);
    const { timestamp } = decoded;
    const currentTime = Date.now();
    return currentTime - timestamp < 60 * 60 * 1000; // Verificar si han pasado menos de una hora
  } catch (error) {
    return false; // Token inválido
  }
};

passport.use(
  "login",
  new Strategy(
    { usernameField: "email", passwordField: "password" },
    async (username, password, done) => {
      try {
        if (
          username === config.userAdmin.email &&
          password === config.userAdmin.password
        ) {
          const token = generateToken(config.userAdmin);
          return done(null, { user: config.userAdmin, token });
        }
        const user = await userService.getByCreds(username, password);
        if (!user)
          return done(null, false, { message: "Contraseña o usuario incorrecto" });
        const token = generateToken(user);
        return done(null, { user, token });
      } catch (error) {
        return done(error);
      }
    }
  )
);

const initializePassport = () => {
  passport.use(
    "register",
    new Strategy(
      { passReqToCallback: true, usernameField: "email", passwordField: "password" },
      async (req, username, password, done) => {
        const { confirm, first_name, last_name, age } = req.body;
        let emailUsed = await userService.getByEmail(username);
        if (emailUsed) {
          return done("Ya existe un usario con este correo electrónico", false);
        }
        if (password !== confirm) {
          return done("Las contraseñas no coinciden", false);
        }
        const newCart = await cm.addCart();
        const user = {
          first_name,
          last_name,
          age,
          email: username,
          password,
          cart: newCart._id,
        };
        await userService.add(user);
        let addUser = await userService.getByEmail(user.email);
        const token = generateToken(addUser);
        return done(null, { user: addUser, token });
      }
    )
  );

  passport.use(
    "github",
    new StrategyGitHub(
      {
        clientID: "Iv1.6d1c1b3a5778cb34",
        clientSecret: "551f13b31eb6eb2b526ac1cf0ca51af93a564b4c",
        callbackURL: `http://localhost:${port}/api/sessions/githubcallbackapata`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await userService.getByEmail(profile._json.email);
          if (!user) {
            const newCart = await cm.addCart();
            let newUser = {
              first_name: profile._json.name,
              email: profile._json.email,
              cart: newCart[0]._id,
            };
            let result = await userService.add(newUser);
            const token = generateToken(result);
            done(null, { user: result, token });
          } else {
            const token = generateToken(user);
            done(null, { user, token });
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.user._id);
  });

  passport.deserializeUser(async (id, done) => {
    let user;
    if (id === 1) {
      user = config.userAdmin;
    } else {
      try {
        user = await userService.getById(id);
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  });
};

export default initializePassport;
