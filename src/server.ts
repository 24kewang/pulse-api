// Local development only. On Vercel, api/index.ts is the entrypoint.
import app from "./app";
import Config from "./common/config";

app.listen(Config.PORT, () => {
    console.log(`Server started on http://localhost:${Config.PORT}`);
});
