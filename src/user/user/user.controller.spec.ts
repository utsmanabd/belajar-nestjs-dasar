import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import * as httpMock from 'node-mocks-http'
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      imports: [],
      providers: [UserService]
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should can say hello', async () => {
    const response = await controller.getByQuery('Utsman', 22, 'Serang')
    expect(response).toBe(`Hello Utsman. Your age is 22. Your city is Serang`)
  });

  it('should can view template', async () => {
    const res = httpMock.createResponse()
    const req = httpMock.createRequest()
    controller.viewHello('Utsman', res, req)

    expect(res._getRenderView()).toBe('index.html')
    expect(res._getRenderData()).toEqual({
      name: '<no name>',
      title: 'Template Engine'
    })
  })
});
