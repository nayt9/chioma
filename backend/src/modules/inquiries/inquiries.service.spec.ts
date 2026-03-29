import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InquiriesService } from './inquiries.service';

describe('InquiriesService', () => {
  const inquiryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const propertyRepository = {
    findOne: jest.fn(),
  };

  const notificationsService = {
    notify: jest.fn(),
  };

  let service: InquiriesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new InquiriesService(
      inquiryRepository as any,
      propertyRepository as any,
      notificationsService as any,
    );
  });

  it('creates inquiry and triggers owner notification', async () => {
    propertyRepository.findOne.mockResolvedValue({
      id: 'property-1',
      ownerId: 'owner-1',
      title: 'Lekki Apartment',
    });

    inquiryRepository.create.mockImplementation((input) => input);
    inquiryRepository.save.mockImplementation(async (input) => ({
      id: 'inq-1',
      ...input,
    }));

    const result = await service.createInquiry('tenant-1', {
      propertyId: 'property-1',
      message: 'Is this still available?',
      name: 'Jane',
      email: 'jane@example.com',
      phone: '+2340000000',
    });

    expect(result.id).toBe('inq-1');
    expect(notificationsService.notify).toHaveBeenCalledWith(
      'owner-1',
      'New property inquiry',
      'Jane sent an inquiry for Lekki Apartment.',
      'PROPERTY_INQUIRY',
    );
  });

  it('throws if property does not exist', async () => {
    propertyRepository.findOne.mockResolvedValue(null);

    await expect(
      service.createInquiry('tenant-1', {
        propertyId: 'missing',
        message: 'hello',
      } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws if user inquires on own property', async () => {
    propertyRepository.findOne.mockResolvedValue({
      id: 'property-1',
      ownerId: 'tenant-1',
      title: 'Self Owned',
    });

    await expect(
      service.createInquiry('tenant-1', {
        propertyId: 'property-1',
        message: 'hello',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
