import { FieldMappingService } from '../service/FieldMappingService';

export async function onRequest(context: any) {
  try {
    // Create an instance of the FieldMappingService
    const fieldMappingService = new FieldMappingService();
    
    // Generate field mapping reports
    const reports = await fieldMappingService.generateFieldMappingReports();
    
    // Return the reports as JSON
    return new Response(JSON.stringify({ reports }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in field-mapping-reports API:', error);
    
    // Return an error response
    return new Response(
      JSON.stringify({
        error: 'Failed to generate field mapping reports',
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 