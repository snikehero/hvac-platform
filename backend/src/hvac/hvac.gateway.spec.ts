import { Test, TestingModule } from '@nestjs/testing';
import { HvacGateway } from './hvac.gateway';

describe('HvacGateway', () => {
  let gateway: HvacGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HvacGateway],
    }).compile();

    gateway = module.get<HvacGateway>(HvacGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
