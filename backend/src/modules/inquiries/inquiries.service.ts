import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../properties/entities/property.entity';
import { NotificationsService } from '../notifications/notifications.service';
import {
  PropertyInquiry,
  PropertyInquiryStatus,
} from './entities/property-inquiry.entity';
import { CreatePropertyInquiryDto } from './dto/create-property-inquiry.dto';

@Injectable()
export class InquiriesService {
  constructor(
    @InjectRepository(PropertyInquiry)
    private readonly inquiryRepository: Repository<PropertyInquiry>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createInquiry(
    fromUserId: string,
    dto: CreatePropertyInquiryDto,
  ): Promise<PropertyInquiry> {
    const property = await this.propertyRepository.findOne({
      where: { id: dto.propertyId },
      select: ['id', 'title', 'ownerId'],
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.ownerId === fromUserId) {
      throw new BadRequestException(
        'You cannot inquire about your own property',
      );
    }

    const inquiry = this.inquiryRepository.create({
      propertyId: property.id,
      fromUserId,
      toUserId: property.ownerId,
      message: dto.message,
      senderName: dto.name ?? null,
      senderEmail: dto.email ?? null,
      senderPhone: dto.phone ?? null,
      status: PropertyInquiryStatus.PENDING,
      viewedAt: null,
    });

    const saved = await this.inquiryRepository.save(inquiry);

    await this.notificationsService.notify(
      property.ownerId,
      'New property inquiry',
      `${dto.name || 'A user'} sent an inquiry for ${property.title}.`,
      'PROPERTY_INQUIRY',
    );

    return saved;
  }

  async listIncoming(userId: string): Promise<PropertyInquiry[]> {
    return this.inquiryRepository.find({
      where: { toUserId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async listOutgoing(userId: string): Promise<PropertyInquiry[]> {
    return this.inquiryRepository.find({
      where: { fromUserId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markViewed(id: string, userId: string): Promise<PropertyInquiry> {
    const inquiry = await this.inquiryRepository.findOne({
      where: { id, toUserId: userId },
    });

    if (!inquiry) {
      throw new NotFoundException('Inquiry not found');
    }

    if (inquiry.status === PropertyInquiryStatus.VIEWED) {
      return inquiry;
    }

    inquiry.status = PropertyInquiryStatus.VIEWED;
    inquiry.viewedAt = new Date();
    return this.inquiryRepository.save(inquiry);
  }
}
