import * as cookieParser from 'cookie-parser'
import * as cors from 'cors'


if(!process.env.IS_TS_NODE){
  require('module-alias/register')
}


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    cors : true
  });
  app.use(cookieParser());
  app.use(
    cors({
      origin: 'http://localhost:5173', // Адрес вашего фронтенда
      credentials: true, // Разрешить куки
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

