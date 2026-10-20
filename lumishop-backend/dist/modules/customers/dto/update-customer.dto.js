import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCustomerDto } from './create-customer.dto.js';
export class UpdateCustomerDto extends PartialType(OmitType(CreateCustomerDto, ['tenDangNhap', 'matKhau'])) {
}
//# sourceMappingURL=update-customer.dto.js.map