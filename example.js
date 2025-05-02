import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ResponseStatus } from '../types/responseStatus';
import { ITokenPayload } from '@src/auth/types/tokens';
import { Roles } from '@src/core/types/roles';

import { Errors } from '@src/locales/errors';

import { ROLES_KEY } from '@src/core/decorators/rolesDecorator';

// Реализация проверки ролевой модели доступа до эндпоинтов
// В приложении существует набор ролей
// Эндпоинт может быть доступен для всех ролей, для одной роли, для набора ролей
// Наличие этого декоратора обеспечивает проверку ролевой модели, и ограничение доступа до эндпоинтов в системе
// Использование на контроллерах
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): never | boolean {
        const availableRoles = this.reflector.getAllAndOverride<Roles[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!availableRoles) {
            return true;
        }

        const { user }: { user: ITokenPayload } = context
            .switchToHttp()
            .getRequest();

        const hasRole = availableRoles.includes(user.role);

        if (!hasRole) {
            throw new ForbiddenException({
                message: Errors.ForbidedResource(),
                status: ResponseStatus.Error,
                statusCode: HttpStatus.FORBIDDEN,
            });
        }

        return true;
    }
}


// *************************


// Общий шаблон ответов об успешных запросов
// Используется в качестве декоратора для контроллеров, где необходима проверка ролей
export class SuccessResponseDtoBase {
    @ApiProperty({
        example: ResponseStatus.Success,
        description: 'Строка со статусом об успешном ответе',
    })
    status: string;
    @ApiProperty({
        example: HttpStatus.OK,
        description: 'Код ответа',
    })
    statusCode: HttpStatus;
}


// ***************************

// Реализация контроллера для доменной сущности "Категории"
// Используется, как стандарный NestJS контроллер
@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}
    @Version('1')
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ description: 'Получение всех категорий' })
    async getAll(): Promise<Category[]> {
        return this.categoryService.findAll();
    }

    @Version('1')
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: 400,
        description: 'e',
        example: {
            status: ResponseStatus.Error,
            message: Errors.NotFoundCategory(),
        },
    })
    @ApiOperation({ description: 'Получение категории по идентификатору' })
    async getById(@Param('id', ParseUUIDPipe) id: string): Promise<Category> {
        return await this.categoryService.findOneById(id);
    }

    @Version('1')
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth('jwt-token')
    @RolesAccess(Roles.Admin)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({
        status: 400,
        description: 'Запрос завершился ошибкой',
        type: BadRequestResponseErrorBase,
    })
    @ApiResponse({
        status: 401,
        description: 'Ресурс доступен только авторизованным пользователям',
        type: AuthorizationResponseErrorBase,
    })
    @ApiResponse({
        status: 403,
        description: 'Недостаточно прав доступа',
        type: ForbiddenResponseErrorBase,
    })
    @ApiOperation({ description: 'Создание категории' })
    async create(
        @Body() categoryCreatedDto: CreateCategoryRequestDto,
    ): Promise<CreateCategoryResponseDto> {
        const categoryId =
            await this.categoryService.createById(categoryCreatedDto);
        return {
            id: categoryId,
            message: Messages.CategorySuccessCreated(categoryCreatedDto.title),
            status: ResponseStatus.Success,
            statusCode: HttpStatus.CREATED,
        };
    }

    @Version('1')
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('jwt-token')
    @RolesAccess(Roles.Admin)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({
        status: 400,
        description: 'Запрос завершился ошибкой',
        type: BadRequestResponseErrorBase,
    })
    @ApiResponse({
        status: 401,
        description: 'Ресурс доступен только авторизованным пользователям',
        type: AuthorizationResponseErrorBase,
    })
    @ApiResponse({
        status: 403,
        description: 'Недостаточно прав доступа',
        type: ForbiddenResponseErrorBase,
    })
    @ApiOperation({ description: 'Изменение категории' })
    async patch(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateCategoryDto: UpdateCategoryRequestDto,
    ): Promise<UpdateCategoryResponseDto> {
        const category = await this.categoryService.updateById(
            id,
            updateCategoryDto,
        );

        return {
            id: category.id,
            message: Messages.CategorySuccessUpdated(),
            status: ResponseStatus.Success,
            statusCode: HttpStatus.OK,
        };
    }
    @Version('1')
    @Delete(':id')
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiBearerAuth('jwt-token')
    @RolesAccess(Roles.Admin)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({
        status: 400,
        description: 'Запрос завершился ошибкой',
        type: BadRequestResponseErrorBase,
    })
    @ApiResponse({
        status: 401,
        description: 'Ресурс доступен только авторизованным пользователям',
        type: AuthorizationResponseErrorBase,
    })
    @ApiResponse({
        status: 403,
        description: 'Недостаточно прав доступа',
        type: ForbiddenResponseErrorBase,
    })
    @ApiOperation({ description: 'Удаление категории' })
    async delete(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<DeleteCategoryResponseDto> {
        const category = await this.categoryService.deleteById(id);

        return {
            id: category.id,
            message: Messages.CategorySuccessDeleted(category.title),
            status: ResponseStatus.Success,
            statusCode: HttpStatus.OK,
        };
    }
}

// В целом я полностью соглашусь, что очевидные для себя моменты, совершенно не очевидны для других разработчиков
// Регулярно на новых проектах, приходится сидеть медитировать над кодом. Собирать по кусочкам общую картину.
// В целом, на нескольких проектах тим лид настаивал на комментировании сложной алгоритмической логики - например, были вложенные списки
// и выбранные чекбоксы считались довольно сложным, рекурсивным алгоритмом, опираясь на собственное рекурсивное представление

// В остальных проектах - чаще всего это стандарные TODO - на этапе написания, что нужно доделать. Или банальные правки на будущее.

// Я согласен, что общее описание кода очень пригодится. Чуть более сложно, и не всегда понятно, как описывать общую структуру?
// Где, для чего используется, но без внутренних подробностей? Или делить - описывать общую структуру, плюс сложные внутренние моменты?

// В любом случае, с комментариями легче, чем без них.
// Десяток Кб в сборке погоды не сделают. Главное - пройти сквозь терни код ревью, где комментарии часто не одобряют.