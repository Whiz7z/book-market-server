import allowedOrigins from "./allowedOriginsy";

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200,
};

export default corsOptions;
