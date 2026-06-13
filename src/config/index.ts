import dotenv from "dotenv";
import {env} from "process"

dotenv.config({quiet:true})

const config ={
    port:env.PORT,
    db_url:env.DB_URL,
    jwt_access_secret:env.JWT_ACCESS_SECRET as string,
    jwt_refresh_secret:env.JWT_REFRESH_SECRET as string,
}

export default config;