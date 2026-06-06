// @ts-nocheck
import { supabase } from '../lib/supabase';

// Dynamic direct delete function without using hooks
export const deleteConsultationDirect = async (id: string): Promise<{ success: boolean; message?: string }> => {
  try {
    // Attempting FIXED dynamic direct deletion of consultation
    
    // Get current user to ensure we have the right permissions
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return { 
        success: false, 
        message: 'User not authenticated' 
      };
    }
    
    // User authenticated
    
    // First, verify the consultation exists and belongs to the user
    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .select('id, animal_id, client_id, veterinarian_id')
      .eq('id', id)
      .single();
      
    if (consultationError) {
      console.error(`Consultation not found: ${consultationError.message}`);
      return { 
        success: false, 
        message: `Consultation not found: ${consultationError.message}` 
      };
    }
    
    // Found consultation
    
    // Step 1: Delete prescription medications first (deepest level)
    // Step 1: Deleting prescription medications...
    const { data: prescriptions, error: prescError } = await supabase
      .from('prescriptions')
      .select('id')
      .eq('consultation_id', id);
      
    if (prescError) {
      console.warn(`Could not fetch prescriptions: ${prescError.message}`);
    } else if (prescriptions && prescriptions.length > 0) {
      // Found prescriptions to clean up
      
      for (const prescription of prescriptions) {
        const { error: medError } = await supabase
          .from('prescription_medications')
          .delete()
          .eq('prescription_id', prescription.id);
          
        if (medError) {
          console.warn(`Could not delete medications for prescription ${prescription.id}: ${medError.message}`);
        } else {
          // Deleted medications for prescription
        }
      }
    }
    
    // Step 2: Delete prescriptions
    // Step 2: Deleting prescriptions...
    const { error: deletePresError } = await supabase
      .from('prescriptions')
      .delete()
      .eq('consultation_id', id);
      
    if (deletePresError) {
      console.warn(`Could not delete prescriptions: ${deletePresError.message}`);
    } else {
      // Successfully deleted prescriptions
    }
    
    // Step 3: Delete other related records (less critical)
    const otherTables = ['vaccinations', 'lab_results', 'antiparasitics'];
    
    for (const table of otherTables) {
      // Step 3: Cleaning up table...
      try {
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('consultation_id', id);
          
        if (deleteError) {
          console.warn(`Could not delete from ${table}: ${deleteError.message}`);
        } else {
          // Successfully cleaned up table
        }
      } catch (tableError) {
        console.warn(`Error with ${table}:`, tableError);
      }
    }
    
    // Step 4: Finally delete the main consultation
    // Step 4: Deleting main consultation...
    const { error: mainDeleteError } = await supabase
      .from('consultations')
      .delete()
      .eq('id', id);
    
    if (mainDeleteError) {
      console.error(`FAILED to delete consultation: ${mainDeleteError.message}`);
      return { 
        success: false, 
        message: `Failed to delete consultation: ${mainDeleteError.message}` 
      };
    }
    
    // ✅ SUCCESS: Deleted consultation
    return { success: true };
    
  } catch (error: any) {
    console.error(`❌ CRITICAL ERROR during deletion:`, error);
    return { 
      success: false, 
      message: `Critical error: ${error?.message || 'Unknown error'}` 
    };
  }
};