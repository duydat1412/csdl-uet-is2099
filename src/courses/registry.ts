import {
  COURSE_TEMPLATE_MANIFEST,
  INT2210_PREVIEW_COURSE,
  MAT1052_PREVIEW_COURSE,
} from './_course-template';
import { IS2099_COURSE } from './is2099-database';
import { CourseManifest } from '../platform/types';

/**
 * Sổ đăng ký Môn học Toàn cầu (Multi-Course Registry).
 * Muốn thêm môn mới vào STUDYHUB: tạo thư mục trong `src/courses/<ma-mon>/` theo mẫu
 * `src/courses/_course-template/` rồi thêm manifest vào danh sách dưới đây.
 */
export const ALL_COURSES: CourseManifest[] = [
  IS2099_COURSE,
  MAT1052_PREVIEW_COURSE,
  INT2210_PREVIEW_COURSE,
  COURSE_TEMPLATE_MANIFEST,
];

export function findCourseById(courseId: string): CourseManifest {
  return ALL_COURSES.find((c) => c.id === courseId) ?? ALL_COURSES[0];
}
