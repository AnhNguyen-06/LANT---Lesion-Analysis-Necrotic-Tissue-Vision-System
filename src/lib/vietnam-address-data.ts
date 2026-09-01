/**
 * Vietnam Administrative Geo-Address Data
 * 63 Provinces / Cities with cascading Districts and Wards
 */

export interface Ward {
  name: string;
}

export interface District {
  name: string;
  wards: string[];
}

export interface Province {
  name: string;
  districts: District[];
}

export const VIETNAM_PROVINCES: Province[] = [
  {
    name: "Thành phố Hồ Chí Minh",
    districts: [
      {
        name: "Quận 1",
        wards: ["Phường Bến Thành", "Phường Bến Nghé", "Phường Đa Kao", "Phường Tân Định", "Phường Phạm Ngũ Lão", "Phường Cầu Kho", "Phường Cầu Ông Lãnh", "Phường Nguyễn Thái Bình", "Phường Nguyễn Cư Trinh", "Phường Cô Giang"]
      },
      {
        name: "Quận 3",
        wards: ["Phường Võ Thị Sáu", "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 9", "Phường 11", "Phường 12", "Phường 14"]
      },
      {
        name: "Quận 5",
        wards: ["Phường 1", "Phường 2", "Phường 4", "Phường 5", "Phường 7", "Phường 8", "Phường 11", "Phường 12", "Phường 14", "Phường 15"]
      },
      {
        name: "Quận 10",
        wards: ["Phường 1", "Phường 2", "Phường 4", "Phường 6", "Phường 8", "Phường 9", "Phường 12", "Phường 13", "Phường 14", "Phường 15"]
      },
      {
        name: "Thành phố Thủ Đức",
        wards: ["Phường Thảo Điền", "Phường An Phú", "Phường Bình An", "Phường Thủ Thiêm", "Phường Linh Trung", "Phường Linh Tây", "Phường Hiệp Phú", "Phường Tăng Nhơn Phú A", "Phường Phước Long B", "Phường Long Thạnh Mỹ"]
      },
      {
        name: "Quận Bình Thạnh",
        wards: ["Phường 1", "Phường 2", "Phường 3", "Phường 5", "Phường 7", "Phường 11", "Phường 12", "Phường 14", "Phường 19", "Phường 25"]
      },
      {
        name: "Quận Tân Bình",
        wards: ["Phường 1", "Phường 2", "Phường 4", "Phường 5", "Phường 8", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 15"]
      },
      {
        name: "Quận Gò Vấp",
        wards: ["Phường 1", "Phường 3", "Phường 5", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 14", "Phường 16"]
      }
    ]
  },
  {
    name: "Thành phố Hà Nội",
    districts: [
      {
        name: "Quận Hoàn Kiếm",
        wards: ["Phường Hàng Bài", "Phường Tràng Tiền", "Phường Phan Chu Trinh", "Phường Hàng Bạc", "Phường Hàng Đào", "Phường Cửa Đông", "Phường Cửa Nam", "Phường Lý Thái Tổ", "Phường Đồng Xuân", "Phường Chương Dương"]
      },
      {
        name: "Quận Ba Đình",
        wards: ["Phường Điện Bàn", "Phường Đội Cấn", "Phường Giảng Võ", "Phường Kim Mã", "Phường Liễu Giai", "Phường Ngọc Hà", "Phường Quán Thánh", "Phường Thành Công", "Phường Trúc Bạch", "Phường Vĩnh Phúc"]
      },
      {
        name: "Quận Đống Đa",
        wards: ["Phường Phương Mai", "Phường Ô Chợ Dừa", "Phường Láng Hạ", "Phường Láng Thượng", "Phường Khâm Thiên", "Phường Cát Linh", "Phường Văn Miếu", "Phường Quốc Tử Giám", "Phường Trung Tự", "Phường Kim Liên"]
      },
      {
        name: "Quận Cầu Giấy",
        wards: ["Phường Dịch Vọng", "Phường Dịch Vọng Hậu", "Phường Mai Dịch", "Phường Nghĩa Đô", "Phường Nghĩa Tân", "Phường Quan Hoa", "Phường Trung Hòa", "Phường Yên Hòa"]
      },
      {
        name: "Quận Hai Bà Trưng",
        wards: ["Phường Bách Khoa", "Phường Bạch Đằng", "Phường Bạch Mai", "Phường Cầu Dền", "Phường Đống Mác", "Phường Đồng Nhân", "Phường Lê Đại Hành", "Phường Minh Khai", "Phường Thanh Lương", "Phường Vĩnh Tuy"]
      }
    ]
  },
  {
    name: "Thành phố Đà Nẵng",
    districts: [
      {
        name: "Quận Hải Châu",
        wards: ["Phường Thạch Thang", "Phường Hải Châu 1", "Phường Hải Châu 2", "Phường Phước Ninh", "Phường Hòa Thuận Tây", "Phường Hòa Thuận Đông", "Phường Nam Dương", "Phường Bình Hiên", "Phường Bình Thuận", "Phường Thuận Phước"]
      },
      {
        name: "Quận Thanh Khê",
        wards: ["Phường Tam Thuận", "Phường Thanh Khê Tây", "Phường Thanh Khê Đông", "Phường Xuân Hà", "Phường Tân Chính", "Phường Chính Gián", "Phường Vĩnh Trung", "Phường Thạc Gián", "Phường An Khê", "Phường Hòa Khê"]
      },
      {
        name: "Quận Sơn Trà",
        wards: ["Phường An Hải Bắc", "Phường An Hải Tây", "Phường An Hải Đông", "Phường Phước Mỹ", "Phường Mân Thái", "Phường Thọ Quang", "Phường Nại Hiên Đông"]
      },
      {
        name: "Quận Ngũ Hành Sơn",
        wards: ["Phường Mỹ An", "Phường Khuê Mỹ", "Phường Hòa Hải", "Phường Hòa Quý"]
      }
    ]
  },
  {
    name: "Thành phố Cần Thơ",
    districts: [
      {
        name: "Quận Ninh Kiều",
        wards: ["Phường Tân An", "Phường An Cư", "Phường An Nghiệp", "Phường An Hòa", "Phường Thới Bình", "Phường Cái Khế", "Phường An Khánh", "Phường Hưng Lợi", "Phường Xuân Khánh"]
      },
      {
        name: "Quận Bình Thủy",
        wards: ["Phường Bình Thủy", "Phường Trà An", "Phường Trà Nóc", "Phường Thới An Đông", "Phường An Thới", "Phường Bùi Hữu Nghĩa", "Phường Long Hòa", "Phường Long Tuyền"]
      }
    ]
  },
  {
    name: "Thành phố Hải Phòng",
    districts: [
      {
        name: "Quận Hồng Bàng",
        wards: ["Phường Hoàng Văn Thụ", "Phường Minh Khai", "Phường Phan Bội Châu", "Phường Sở Dầu", "Phường Thượng Lý", "Phường Hạ Lý", "Phường Hùng Vương", "Phường Quán Toan", "Phường Trại Chuối"]
      },
      {
        name: "Quận Ngô Quyền",
        wards: ["Phường Cầu Đất", "Phường Cầu Tre", "Phường Đằng Giang", "Phường Gia Viên", "Phường Lạc Viên", "Phường Lạch Tray", "Phường Lê Lợi", "Phường Máy Chai", "Phường Máy Tơ", "Phường Vạn Mỹ"]
      }
    ]
  },
  {
    name: "Tỉnh Bình Dương",
    districts: [
      {
        name: "Thành phố Thủ Dầu Một",
        wards: ["Phường Phú Cường", "Phường Hiệp Thành", "Phường Chánh Nghĩa", "Phường Phú Hòa", "Phường Phú Lợi", "Phường Phú Thọ", "Phường Định Hòa", "Phường Hòa Phú"]
      },
      {
        name: "Thành phố Dĩ An",
        wards: ["Phường Dĩ An", "Phường An Bình", "Phường Bình An", "Phường Bình Thắng", "Phường Đông Hòa", "Phường Tân Bình", "Phường Tân Đông Hiệp"]
      }
    ]
  },
  {
    name: "Tỉnh Đồng Nai",
    districts: [
      {
        name: "Thành phố Biên Hòa",
        wards: ["Phường Quyết Thắng", "Phường Thanh Bình", "Phường Trung Dũng", "Phường Quang Vinh", "Phường Tân Phong", "Phường Tân Mai", "Phường Thống Nhất", "Phường Trảng Dài", "Phường Hố Nai"]
      }
    ]
  },
  {
    name: "Tỉnh Thừa Thiên Huế",
    districts: [
      {
        name: "Thành phố Huế",
        wards: ["Phường Vĩnh Ninh", "Phường Phú Nhuận", "Phường Phú Hội", "Phường Thuận Lộc", "Phường Thuận Hòa", "Phường Tây Lộc", "Phường Kim Long", "Phường Hương Sơ", "Phường An Đông"]
      }
    ]
  },
  {
    name: "Tỉnh Khánh Hòa",
    districts: [
      {
        name: "Thành phố Nha Trang",
        wards: ["Phường Lộc Thọ", "Phường Phước Tiến", "Phường Vạn Thắng", "Phường Vạn Thạnh", "Phường Phương Sài", "Phường Phước Tân", "Phường Tân Lập", "Phường Vĩnh Nguyên", "Phường Vĩnh Trường"]
      }
    ]
  },
  {
    name: "Tỉnh Quảng Ninh",
    districts: [
      {
        name: "Thành phố Hạ Long",
        wards: ["Phường Bạch Đằng", "Phường Bãi Cháy", "Phường Cao Xanh", "Phường Hà Khẩu", "Phường Hà Lầm", "Phường Hà Phong", "Phường Hà Tu", "Phường Hồng Gai", "Phường Hồng Hà", "Phường Hùng Thắng"]
      }
    ]
  },
  // Other Provinces
  {
    name: "Tỉnh An Giang",
    districts: [{ name: "Thành phố Long Xuyên", wards: ["Phường Mỹ Bình", "Phường Mỹ Long", "Phường Mỹ Xuyên", "Phường Bình Đức", "Phường Bình Khánh"] }]
  },
  {
    name: "Tỉnh Bà Rịa - Vũng Tàu",
    districts: [{ name: "Thành phố Vũng Tàu", wards: ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 7", "Phường 8", "Phường Thắng Nhì"] }]
  },
  {
    name: "Tỉnh Bắc Giang",
    districts: [{ name: "Thành phố Bắc Giang", wards: ["Phường Hoàng Văn Thụ", "Phường Lê Lợi", "Phường Ngô Quyền", "Phường Trần Nguyên Hãn"] }]
  },
  {
    name: "Tỉnh Bắc Kạn",
    districts: [{ name: "Thành phố Bắc Kạn", wards: ["Phường Đức Xuân", "Phường Nguyễn Thị Minh Khai", "Phường Phùng Chí Kiên", "Phường Sông Cầu"] }]
  },
  {
    name: "Tỉnh Bạc Liêu",
    districts: [{ name: "Thành phố Bạc Liêu", wards: ["Phường 1", "Phường 2", "Phường 3", "Phường 5", "Phường 7", "Phường 8", "Phường Nhà Mát"] }]
  },
  {
    name: "Tỉnh Bắc Ninh",
    districts: [{ name: "Thành phố Bắc Ninh", wards: ["Phường Đại Phúc", "Phường Đáp Cầu", "Phường Hạp Lĩnh", "Phường Khắc Niệm", "Phường Ninh Xá", "Phường Suối Hoa", "Phường Tiền An"] }]
  },
  {
    name: "Tỉnh Bến Tre",
    districts: [{ name: "Thành phố Bến Tre", wards: ["Phường An Hội", "Phường Phú Khương", "Phường Phú Tân", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8"] }]
  },
  {
    name: "Tỉnh Bình Định",
    districts: [{ name: "Thành phố Quy Nhơn", wards: ["Phường Lê Lợi", "Phường Trần Phú", "Phường Lê Hồng Phong", "Phường Lý Thường Kiệt", "Phường Nguyễn Văn Cừ", "Phường Ghềnh Ráng"] }]
  },
  {
    name: "Tỉnh Bình Phước",
    districts: [{ name: "Thành phố Đồng Xoài", wards: ["Phường Tân Phú", "Phường Tân Đồng", "Phường Tân Bình", "Phường Tân Xuân", "Phường Tiến Thành"] }]
  },
  {
    name: "Tỉnh Bình Thuận",
    districts: [{ name: "Thành phố Phan Thiết", wards: ["Phường Đức Nghĩa", "Phường Đức Thắng", "Phường Lạc Đạo", "Phường Phú Thủy", "Phường Thanh Hải", "Phường Mũi Né"] }]
  },
  {
    name: "Tỉnh Cà Mau",
    districts: [{ name: "Thành phố Cà Mau", wards: ["Phường 1", "Phường 2", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường Tân Thành"] }]
  },
  {
    name: "Tỉnh Cao Bằng",
    districts: [{ name: "Thành phố Cao Bằng", wards: ["Phường Hợp Giang", "Phường Sông Bằng", "Phường Sông Hiến", "Phường Tân Giang", "Phường Đề Thám"] }]
  },
  {
    name: "Tỉnh Đắk Lắk",
    districts: [{ name: "Thành phố Buôn Ma Thuột", wards: ["Phường Tân An", "Phường Tân Lập", "Phường Tân Lợi", "Phường Tân Thành", "Phường Tân Tiến", "Phường Thắng Lợi", "Phường Thống Nhất"] }]
  },
  {
    name: "Tỉnh Đắk Nông",
    districts: [{ name: "Thành phố Gia Nghĩa", wards: ["Phường Nghĩa Đức", "Phường Nghĩa Phú", "Phường Nghĩa Tân", "Phường Nghĩa Thành", "Phường Nghĩa Trung", "Phường Quảng Thành"] }]
  },
  {
    name: "Tỉnh Điện Biên",
    districts: [{ name: "Thành phố Điện Biên Phủ", wards: ["Phường Him Lam", "Phường Mường Thanh", "Phường Nam Thanh", "Phường Noong Bua", "Phường Tân Thanh", "Phường Thanh Bình"] }]
  },
  {
    name: "Tỉnh Gia Lai",
    districts: [{ name: "Thành phố Pleiku", wards: ["Phường Diên Hồng", "Phường Đống Đa", "Phường Hoa Lư", "Phường Hội Phú", "Phường Hội Thương", "Phường Ia Kring", "Phường Phù Đổng"] }]
  },
  {
    name: "Tỉnh Hà Giang",
    districts: [{ name: "Thành phố Hà Giang", wards: ["Phường Minh Khai", "Phường Ngọc Hà", "Phường Nguyễn Trãi", "Phường Quang Trung", "Phường Trần Phú"] }]
  },
  {
    name: "Tỉnh Hà Nam",
    districts: [{ name: "Thành phố Phủ Lý", wards: ["Phường Châu Cầu", "Phường Hai Bà Trưng", "Phường Lam Hạ", "Phường Lê Hồng Phong", "Phường Lương Khánh Thiện", "Phường Minh Khai"] }]
  },
  {
    name: "Tỉnh Hà Tĩnh",
    districts: [{ name: "Thành phố Hà Tĩnh", wards: ["Phường Bắc Hà", "Phường Đại Nài", "Phường Hà Huy Tập", "Phường Nam Hà", "Phường Tân Giang", "Phường Thạch Linh", "Phường Thạch Quý", "Phường Trần Phú"] }]
  },
  {
    name: "Tỉnh Hải Dương",
    districts: [{ name: "Thành phố Hải Dương", wards: ["Phường Bình Hàn", "Phường Cẩm Thượng", "Phường Hải Tân", "Phường Lê Thanh Nghị", "Phường Ngọc Châu", "Phường Nguyễn Trãi", "Phường Phạm Ngũ Lão", "Phường Quang Trung", "Phường Trần Hưng Đạo", "Phường Trần Phú"] }]
  },
  {
    name: "Tỉnh Hậu Giang",
    districts: [{ name: "Thành phố Vị Thanh", wards: ["Phường 1", "Phường 3", "Phường 4", "Phường 5", "Phường 7"] }]
  },
  {
    name: "Tỉnh Hòa Bình",
    districts: [{ name: "Thành phố Hòa Bình", wards: ["Phường Chăm Mát", "Phường Dân Chủ", "Phường Đồng Tiến", "Phường Hữu Nghị", "Phường Kỳ Sơn", "Phường Phương Lâm", "Phường Tân Hòa", "Phường Tân Thịnh"] }]
  },
  {
    name: "Tỉnh Hưng Yên",
    districts: [{ name: "Thành phố Hưng Yên", wards: ["Phường An Tảo", "Phường Hiến Nam", "Phường Hồng Châu", "Phường Lam Sơn", "Phường Lê Lợi", "Phường Minh Khai", "Phường Quang Trung"] }]
  },
  {
    name: "Tỉnh Kiên Giang",
    districts: [{ name: "Thành phố Rạch Giá", wards: ["Phường An Bình", "Phường An Hòa", "Phường Rạch Sỏi", "Phường Vĩnh Bảo", "Phường Vĩnh Hiệp", "Phường Vĩnh Lạc", "Phường Vĩnh Lợi", "Phường Vĩnh Quang", "Phường Vĩnh Thanh", "Phường Vĩnh Thanh Vân", "Phường Vĩnh Thông"] }]
  },
  {
    name: "Tỉnh Kon Tum",
    districts: [{ name: "Thành phố Kon Tum", wards: ["Phường Duy Tân", "Phường Lê Lợi", "Phường Ngô Mây", "Phường Nguyễn Trãi", "Phường Quang Trung", "Phường Quyết Thắng", "Phường Thắng Lợi", "Phường Thống Nhất", "Phường Trần Hưng Đạo", "Phường Trường Chinh"] }]
  },
  {
    name: "Tỉnh Lai Châu",
    districts: [{ name: "Thành phố Lai Châu", wards: ["Phường Đoàn Kết", "Phường Đông Phong", "Phường Quyết Thắng", "Phường Quyết Tiến", "Phường Tân Phong"] }]
  },
  {
    name: "Tỉnh Lâm Đồng",
    districts: [{ name: "Thành phố Đà Lạt", wards: ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12"] }]
  },
  {
    name: "Tỉnh Lạng Sơn",
    districts: [{ name: "Thành phố Lạng Sơn", wards: ["Phường Chi Lăng", "Phường Đông Kinh", "Phường Hoàng Văn Thụ", "Phường Tam Thanh", "Phường Vĩnh Trại"] }]
  },
  {
    name: "Tỉnh Lào Cai",
    districts: [{ name: "Thành phố Lào Cai", wards: ["Phường Bắc Cường", "Phường Bắc Lệnh", "Phường Bình Minh", "Phường Cốc Lếu", "Phường Duyên Hải", "Phường Kim Tân", "Phường Lào Cai", "Phường Nam Cường", "Phường Pom Hán", "Phường Xuân Tăng"] }]
  },
  {
    name: "Tỉnh Long An",
    districts: [{ name: "Thành phố Tân An", wards: ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường Khánh Hậu", "Phường Tân Khánh"] }]
  },
  {
    name: "Tỉnh Nam Định",
    districts: [{ name: "Thành phố Nam Định", wards: ["Phường Bà Triệu", "Phường Cửa Bắc", "Phường Cửa Nam", "Phường Hạ Long", "Phường Lộc Hạ", "Phường Lộc Vượng", "Phường Năng Tĩnh", "Phường Ngô Quyền", "Phường Nguyễn Du", "Phường Quang Trung", "Phường Thống Nhất", "Phường Trần Đăng Ninh", "Phường Trần Hưng Đạo", "Phường Trần Quang Khải", "Phường Trần Tế Xương", "Phường Trường Thi", "Phường Vị Hoàng", "Phường Vị Xuyên", "Phường Phan Đình Phùng"] }]
  },
  {
    name: "Tỉnh Nghệ An",
    districts: [{ name: "Thành phố Vinh", wards: ["Phường Bến Thủy", "Phường Cửa Nam", "Phường Đội Cung", "Phường Đông Vĩnh", "Phường Hà Huy Tập", "Phường Hưng Bình", "Phường Hưng Dũng", "Phường Hưng Phúc", "Phường Lê Lợi", "Phường Lê Mao", "Phường Quán Bàu", "Phường Quang Trung", "Phường Trung Đô", "Phường Trường Thi", "Phường Vinh Tân", "Phường Hồng Sơn"] }]
  },
  {
    name: "Tỉnh Ninh Bình",
    districts: [{ name: "Thành phố Ninh Bình", wards: ["Phường Bích Đào", "Phường Đông Thành", "Phường Nam Bình", "Phường Nam Thành", "Phường Ninh Khánh", "Phường Ninh Phong", "Phường Ninh Sơn", "Phường Phúc Thành", "Phường Tân Thành", "Phường Thanh Bình", "Phường Vân Giang"] }]
  },
  {
    name: "Tỉnh Ninh Thuận",
    districts: [{ name: "Thành phố Phan Rang - Tháp Chàm", wards: ["Phường Bảo An", "Phường Đài Sơn", "Phường Đạo Long", "Phường Đô Vinh", "Phường Đông Hải", "Phường Kinh Dinh", "Phường Mỹ Bình", "Phường Mỹ Đông", "Phường Mỹ Hải", "Phường Mỹ Hương", "Phường Phủ Hà", "Phường Phước Mỹ", "Phường Tấn Tài", "Phường Thanh Sơn", "Phường Văn Hải"] }]
  },
  {
    name: "Tỉnh Phú Thọ",
    districts: [{ name: "Thành phố Việt Trì", wards: ["Phường Bạch Hạc", "Phường Bến Gót", "Phường Dữu Lâu", "Phường Gia Cẩm", "Phường Minh Nông", "Phường Minh Phương", "Phường Nông Trang", "Phường Tân Dân", "Phường Thanh Miếu", "Phường Thọ Sơn", "Phường Tiên Cát", "Phường Vân Cơ", "Phường Vân Phú"] }]
  },
  {
    name: "Tỉnh Phú Yên",
    districts: [{ name: "Thành phố Tuy Hòa", wards: ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường Phú Đông", "Phường Phú Lâm", "Phường Phú Thạnh"] }]
  },
  {
    name: "Tỉnh Quảng Bình",
    districts: [{ name: "Thành phố Đồng Hới", wards: ["Phường Bắc Lý", "Phường Bắc Nghĩa", "Phường Đồng Hải", "Phường Đồng Mỹ", "Phường Đồng Phú", "Phường Đức Ninh Đông", "Phường Hải Đình", "Phường Hải Thành", "Phường Nam Lý", "Phường Phú Hải"] }]
  },
  {
    name: "Tỉnh Quảng Nam",
    districts: [{ name: "Thành phố Tam Kỳ", wards: ["Phường An Mỹ", "Phường An Phú", "Phường An Sơn", "Phường An Xuân", "Phường Hòa Hương", "Phường Hòa Thuận", "Phường Phước Hòa", "Phường Tân Thạnh", "Phường Trường Xuân"] }, { name: "Thành phố Hội An", wards: ["Phường Cẩm An", "Phường Cẩm Châu", "Phường Cẩm Nam", "Phường Cẩm Phô", "Phường Cửa Đại", "Phường Minh An", "Phường Sơn Phong", "Phường Tân An", "Phường Thanh Hà"] }]
  },
  {
    name: "Tỉnh Quảng Ngãi",
    districts: [{ name: "Thành phố Quảng Ngãi", wards: ["Phường Chánh Lộ", "Phường Lê Hồng Phong", "Phường Nghĩa Chánh", "Phường Nghĩa Dũng", "Phường Nghĩa Lộ", "Phường Nguyễn Nghiêm", "Phường Quảng Phú", "Phường Trần Hưng Đạo", "Phường Trần Phú", "Phường Trương Quang Trọng"] }]
  },
  {
    name: "Tỉnh Quảng Trị",
    districts: [{ name: "Thành phố Đông Hà", wards: ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường Đông Giang", "Phường Đông Lễ", "Phường Đông Lương", "Phường Đông Thanh"] }]
  },
  {
    name: "Tỉnh Sóc Trăng",
    districts: [{ name: "Thành phố Sóc Trăng", wards: ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10"] }]
  },
  {
    name: "Tỉnh Sơn La",
    districts: [{ name: "Thành phố Sơn La", wards: ["Phường Chiềng An", "Phường Chiềng Cơi", "Phường Chiềng Lề", "Phường Chiềng Sinh", "Phường Quyết Tâm", "Phường Quyết Thắng", "Phường Tô Hiệu"] }]
  },
  {
    name: "Tỉnh Tây Ninh",
    districts: [{ name: "Thành phố Tây Ninh", wards: ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường Hiệp Ninh", "Phường Ninh Sơn", "Phường Ninh Thạnh"] }]
  },
  {
    name: "Tỉnh Thái Bình",
    districts: [{ name: "Thành phố Thái Bình", wards: ["Phường Bồ Xuyên", "Phường Đề Thám", "Phường Hoàng Diệu", "Phường Kỳ Bá", "Phường Lê Hồng Phong", "Phường Phú Khánh", "Phường Quang Trung", "Phường Tiền Phong", "Phường Trần Hưng Đạo", "Phường Trần Lãm"] }]
  },
  {
    name: "Tỉnh Thái Nguyên",
    districts: [{ name: "Thành phố Thái Nguyên", wards: ["Phường Cam Giá", "Phường Chùa Hang", "Phường Đồng Bẩm", "Phường Đồng Quang", "Phường Gia Sàng", "Phường Hoàng Văn Thụ", "Phường Hương Sơn", "Phường Phan Đình Phùng", "Phường Phú Xá", "Phường Quan Triều", "Phường Quang Trung", "Phường Tân Lập", "Phường Tân Long", "Phường Tân Thành", "Phường Tân Thịnh", "Phường Thắng Lợi", "Phường Thịnh Đán", "Phường Tích Lương", "Phường Trung Thành", "Phường Túc Duyên"] }]
  },
  {
    name: "Tỉnh Thanh Hóa",
    districts: [{ name: "Thành phố Thanh Hóa", wards: ["Phường Ba Đình", "Phường Điện Biên", "Phường Đông Cương", "Phường Đông Hải", "Phường Đông Hương", "Phường Đông Sơn", "Phường Đông Thọ", "Phường Đông Vệ", "Phường Hàm Rồng", "Phường Lam Sơn", "Phường Nam Ngạn", "Phường Ngọc Trạo", "Phường Phú Sơn", "Phường Quảng Hưng", "Phường Quảng Thành", "Phường Quảng Thắng", "Phường Tào Xuyên", "Phường Tân Sơn", "Phường Trường Thi"] }]
  },
  {
    name: "Tỉnh Tiền Giang",
    districts: [{ name: "Thành phố Mỹ Tho", wards: ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường Tân Long"] }]
  },
  {
    name: "Tỉnh Trà Vinh",
    districts: [{ name: "Thành phố Trà Vinh", wards: ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9"] }]
  },
  {
    name: "Tỉnh Tuyên Quang",
    districts: [{ name: "Thành phố Tuyên Quang", wards: ["Phường An Tường", "Phường Đội Cấn", "Phường Hưng Thành", "Phường Minh Xuân", "Phường Mỹ Lâm", "Phường Nông Tiến", "Phường Phan Thiết", "Phường Tân Hà", "Phường Tân Quang"] }]
  },
  {
    name: "Tỉnh Vĩnh Long",
    districts: [{ name: "Thành phố Vĩnh Long", wards: ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 8", "Phường 9", "Phường Tân Hòa", "Phường Tân Hội", "Phường Tân Ngãi", "Phường Trường An"] }]
  },
  {
    name: "Tỉnh Vĩnh Phúc",
    districts: [{ name: "Thành phố Vĩnh Yên", wards: ["Phường Định Trung", "Phường Đống Đa", "Phường Đồng Tâm", "Phường Hội Hợp", "Phường Khai Quang", "Phường Liên Bảo", "Phường Ngô Quyền", "Phường Tích Sơn"] }]
  },
  {
    name: "Tỉnh Yên Bái",
    districts: [{ name: "Thành phố Yên Bái", wards: ["Phường Đồng Tâm", "Phường Hồng Hà", "Phường Hợp Minh", "Phường Minh Tân", "Phường Nam Cường", "Phường Nguyễn Phúc", "Phường Nguyễn Thái Học", "Phường Yên Ninh", "Phường Yên Thịnh"] }]
  }
];
