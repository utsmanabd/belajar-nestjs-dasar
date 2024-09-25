import { Body, Controller, Get, Header, HttpCode, HttpException, HttpRedirectResponse, Inject, Param, ParseIntPipe, Post, Query, Redirect, Req, Res, UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserService } from './user.service';
import { Connection } from '../connection/connection';
import { MailService } from '../mail/mail.service';
import { UserRepository } from '../user-repository/user-repository';
import { MemberService } from '../member/member.service';
import { User } from '@prisma/client';
import { ValidationFilter } from 'src/validation/validation.filter';
import { LoginUserRequest, loginUserRequestValidation } from 'src/model/login.model';
import { ValidationPipe } from 'src/validation/validation.pipe';
import { TimeInterceptor } from 'src/time/time.interceptor';
import { Auth } from 'src/auth/auth.decorator';
import { RoleGuard } from 'src/role/role.guard';
import { Roles } from 'src/role/role.decorator';

@Controller('/api/users')
export class UserController {
    
    constructor(
        private service: UserService,
        private connection: Connection,
        private mailService: MailService,
        @Inject('EmailService') private emailService: MailService,
        private userRepository: UserRepository,
        private memberService: MemberService
    ) {}

    @Get('/current')
    @Roles(['admin', 'operator'])
    current(@Auth() user: User): Record<string, any> {
        return {
            data: `Hello ${user.first_name} ${user.last_name}`
        }
    }

    @UsePipes(new ValidationPipe(loginUserRequestValidation))
    @UseFilters(ValidationFilter)
    @Post('/login')
    @Header('Content-Type', 'application/json')
    @UseInterceptors(TimeInterceptor)
    login(@Query('name') name: string, @Body() request: LoginUserRequest) {
        return {
            data: `Hello ${request.username}`
        }
    }
    
    @Get('/create')
    async create(
        @Query("first_name") firstName: string,
        @Query("last_name") lastName: string,
    ): Promise<User> {
        if (!firstName) {
            throw new HttpException({
                code: 400,
                errors: "First name must be provided"
            }, 400)
        }
        return this.userRepository.save(firstName, lastName)
    }

    @Get("/connection")
    async getConnection(@Query("name") name: string,): Promise<string> {
        this.mailService.send()
        this.emailService.send()

        console.info(this.memberService.getConnectionName())
        this.memberService.sendEmail()

        return this.connection.getName()
    }

    @Get('/view/hello')
    viewHello(@Query('name') name: string, @Res() res: Response, @Req() req: Request) {
        res.render('index.html', { title: 'Template Engine', name: req.cookies.name  || '<no name>' })
    }

    @Get('/set-cookie')
    setCookie(@Query('name') name: string, @Res() res: Response) {
        res.cookie('name', name);
        res.status(200).send('Success Set Cookie')
    }

    @Get('/get-cookie')
    getCookie(@Req() req: Request): string {
        return req.cookies.name || 'No cookie found';
    }

    @Get('/json-response')
    @Header('Content-Type', 'application/json')
    @HttpCode(200)
    jsonResponse(): Record<string, string> {
        return {
            data: 'Hello JSON'
        }
    }

    @Get('/redirect')
    @Redirect()
    redirect(): HttpRedirectResponse {
        return {
            url: '/api/users/json-response',
            statusCode: 301
        }
    }

    @Get("/hello")
    // @UseFilters(ValidationFilter)
    async sayHello(
        @Query("name") name: string,
    ): Promise<string> {
        return this.service.sayHello(name)
    }

    @Get("/id/:id")
    getById(@Param("id", ParseIntPipe) id: number): string {
        return `GET ${id}`
    }

    @Post()
    post(): string {
        return 'User created successfully';
    }

    @Get('/sample')
    get(): string {
        return 'Get user list of users';
    }

}
