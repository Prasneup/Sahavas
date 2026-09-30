import React from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Listing } from '../../types/room';

interface RoomListingModalProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  listingForm: Listing;
  editingListing: Listing | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleAmenityToggle: (amenity: string) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (index: number) => void;
  imageUploading: boolean;
  availableAmenities: string[];
}

export const RoomListingModal: React.FC<RoomListingModalProps> = ({
  onClose,
  onSubmit,
  listingForm,
  editingListing,
  handleInputChange,
  handleAmenityToggle,
  handleImageUpload,
  handleRemoveImage,
  imageUploading,
  availableAmenities
}) => {
  return (
    <div className="fixed inset-0 bg-[#1E1E1E]/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in overflow-y-auto">
      <div className="bg-paper border border-[#EAE5D9] rounded-[32px] w-full max-w-xl p-6 shadow-2xl animate-scale-in my-8 max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[9px] uppercase tracking-wider block font-bold text-marigold">Property Details</span>
            <h3 className="text-xl mt-0.5 font-black text-ink font-display">
              {editingListing ? 'Edit Listed Flat / Room' : 'Post New Housing Listing'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-clay border border-ink/10 flex items-center justify-center text-ink hover:scale-105 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 text-xs text-left">
          
          {/* Row 1: Title */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase font-bold text-ink-soft">Listing Title</label>
            <input 
              type="text" 
              name="title" 
              required
              value={listingForm.title}
              onChange={handleInputChange}
              placeholder="e.g. Spacious single room near Patan Campus Gate"
              className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold font-semibold"
            />
          </div>

          {/* Row 2: Description */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase font-bold text-ink-soft">Description details</label>
            <textarea 
              name="description" 
              required
              rows={3}
              value={listingForm.description}
              onChange={handleInputChange}
              placeholder="Detail the room configuration, nearby landmarks, student conveniences, water/electricity systems, etc."
              className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold resize-none font-semibold"
            />
          </div>

          {/* Row 3: Rent & Deposit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-ink-soft mb-1.5">Monthly Rent (NPR)</label>
              <input 
                type="number" 
                name="rentAmount" 
                required
                value={listingForm.rentAmount}
                onChange={handleInputChange}
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-ink-soft mb-1.5">Security Deposit (NPR)</label>
              <input 
                type="number" 
                name="depositAmount" 
                required
                value={listingForm.depositAmount}
                onChange={handleInputChange}
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold font-mono font-semibold"
              />
            </div>
          </div>

          {/* Row 4: Room Type, Gender Preference, Proximity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-ink-soft mb-1.5">Room Config Type</label>
              <select 
                name="roomType"
                value={listingForm.roomType}
                onChange={handleInputChange}
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold font-bold text-ink"
              >
                <option value="single_room">Single Room</option>
                <option value="shared_room">Shared Room</option>
                <option value="full_flat">Full Flat</option>
                <option value="annex">Annex</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-ink-soft mb-1.5">Gender Restriction</label>
              <select 
                name="genderPreference"
                value={listingForm.genderPreference}
                onChange={handleInputChange}
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold font-bold text-ink"
              >
                <option value="any">Any / Mixed</option>
                <option value="male">Boys Only</option>
                <option value="female">Girls Only</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-ink-soft mb-1.5">Campus Proximity Text</label>
              <input 
                type="text" 
                name="distanceFromCollegeText" 
                value={listingForm.distanceFromCollegeText || ''}
                onChange={handleInputChange}
                placeholder="e.g. 300m to Pulchowk Campus"
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold font-semibold"
              />
            </div>
          </div>

          {/* Amenities Grid checklist */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-ink-soft mb-2">Amenities Provided</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {availableAmenities.map(amenity => {
                const isChecked = listingForm.amenities.includes(amenity);
                return (
                  <div 
                    key={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`p-2 border rounded-xl flex items-center gap-2 cursor-pointer transition ${
                      isChecked 
                        ? 'bg-amber-50 border-marigold/30 text-marigold-dark' 
                        : 'bg-[#FAF8F5] border-ink/5 text-ink-soft/70 hover:bg-clay/5'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded text-marigold focus:ring-marigold accent-marigold w-3.5 h-3.5"
                    />
                    <span className="text-[10px] font-bold">{amenity}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cloudinary Image Upload */}
          <div className="border-t border-ink/5 pt-4">
            <label className="block text-[10px] uppercase font-bold text-ink-soft mb-2">Property Images</label>
            
            {/* Previews grid */}
            <div className="flex flex-wrap gap-3 mb-3">
              {listingForm.images.map((img, index) => (
                <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-ink/10 group">
                  <img src={img.imageUrl} alt="preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute inset-0 bg-rose-500/80 text-paper font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[9px] uppercase tracking-wider"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              {/* Upload box trigger */}
              <label className="w-20 h-20 border border-dashed border-ink/20 hover:border-marigold/40 rounded-xl flex flex-col items-center justify-center cursor-pointer transition bg-[#FAF8F5] relative">
                {imageUploading ? (
                  <Loader2 size={16} className="text-marigold animate-spin" />
                ) : (
                  <>
                    <Plus size={16} className="text-ink-soft/60" />
                    <span className="text-[8px] text-ink-soft/50 font-bold uppercase mt-1">Upload</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={imageUploading}
                  className="hidden"
                />
              </label>
            </div>
            <span className="text-[9px] text-ink-soft/50 font-semibold block leading-tight">
              * Upload clear property photos. Cloudinary automatically processes image aspect ratios.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 border-t border-ink/5 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-ink/10 hover:bg-clay/10 text-xs font-bold text-ink-soft rounded-xl transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-marigold hover:bg-marigold-dark text-paper text-xs font-black uppercase tracking-wider rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
            >
              {editingListing ? 'Update Listing' : 'Publish Listing'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
