import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiResponseOptions,
} from '@nestjs/swagger';

/**
 * SwaggerEndpointDecorator is a custom decorator that simplifies Swagger documentation in NestJS by automatically generating authentication requirements and error message documentation in addition to standard endpoint metadata.
 * It simplifies the process of adding Swagger metadata to endpoint methods.
 * @param args - An object containing the following properties:
 * @param args.description - The description of the endpoint.
 * @param args.response - The response type of the endpoint.
 * @param args.requireAuth - Whether the endpoint requires authentication (default: true).
 * @param args.errors - An array of error messages that the endpoint can return.
 * @param args.summary - The summary of the endpoint.
 * @returns A decorator that can be applied to a method.
 */
export function SwaggerEndpointDecorator({
  description,
  summary,
  requireAuth = true,
  errors,
  response,
}: {
  description: string;
  response?: ApiResponseOptions;
  summary: string;
  errors?: ReadonlyArray<string>;
  requireAuth?: boolean;
}): MethodDecorator {
  const descriptionSections: string[] = [description.trim()];

  if (requireAuth) {
    descriptionSections.push(
      'This service requires authentication and is available',
    );
  } else {
    descriptionSections.push(
      'This service is publicly accessible and does not require authentication.',
    );
  }

  if (errors?.length) {
    const errorList = errors.map((error) => `- ${error}`).join('\n');
    descriptionSections.push(
      ['This service can return the following error messages:', errorList].join(
        '\n',
      ),
    );
  }

  const formattedDescription = descriptionSections.join('\n\n').trim();
  const decorators = [
    ApiOperation({
      description: formattedDescription,
      summary,
    }),
  ];
  if (response) {
    decorators.push(ApiResponse(response));
  }
  if (requireAuth) {
    decorators.push(ApiBearerAuth());
  }
  return applyDecorators(...decorators);
}
