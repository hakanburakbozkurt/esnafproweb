"use client";

import { useCallback, useState } from "react";
import {
  deleteSecondHandDevice,
  listOwnerSecondHandDevices,
  markSecondHandDeviceSold,
  saveSecondHandDevice,
  updateSecondHandDeviceWebPublishing,
} from "@/lib/cihaz/actions";
import type { DeviceRowForHydrate } from "@/lib/cihaz/hydrate-second-hand-device-form";
import {
  resolveSecondHandPhotoUrls,
  uploadSecondHandDevicePhotos,
} from "@/lib/cihaz/upload-second-hand-device-photos";
import { useCihazAlCategoryForms } from "@/lib/cihaz/use-cihaz-al-category-forms";
import type { IkinciElCihaz, WebPublishingPatch } from "@/lib/cihaz/types";
import { createClient } from "@/lib/supabase/client";

export type {
  ConsoleCategoryForm,
  ComputerCategoryForm,
  PhoneCategoryForm,
  SharedCihazForm,
  TabletCategoryForm,
  WatchCategoryForm,
} from "@/lib/cihaz/use-cihaz-al-category-forms";

export {
  DEVICE_CATEGORY_META,
  KONDISYON_OPTIONS,
  LISTING_TYPE_LABEL,
  PAYMENT_METHOD_OPTIONS,
} from "@/lib/cihaz/types";

export function useCihazVitrini(initialDevices: IkinciElCihaz[] = []) {
  const [devices, setDevices] = useState<IkinciElCihaz[]>(initialDevices);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);

  const forms = useCihazAlCategoryForms();
  const {
    shared,
    phone,
    tablet,
    computer,
    watch,
    console: consoleForm,
    updateShared,
    updatePhone,
    updateTablet,
    updateComputer,
    updateWatch,
    updateConsole,
    setDeviceCategory,
    setListingType,
    resetAll,
    hydrateFromDevice,
  } = forms;

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    const result = await listOwnerSecondHandDevices();
    if (result.ok) {
      setDevices(result.devices);
    }
    setLoading(false);
    return result;
  }, []);

  const saveDevice = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: "Giriş yapılmamış." };
      }

      const deviceCat = shared.device_category;
      const active =
        deviceCat === "tablet"
          ? tablet
          : deviceCat === "computer"
            ? computer
            : deviceCat === "watch"
              ? watch
              : deviceCat === "console"
                ? consoleForm
                : phone;

      const photoUris = active.photo_uris;
      let imageUrls: string[] = [];
      const hasAnyPhoto = photoUris.some(
        (u) => typeof u === "string" && u.trim().length > 0
      );

      if (hasAnyPhoto) {
        const up = editingDeviceId
          ? await resolveSecondHandPhotoUrls(user.id, photoUris)
          : await uploadSecondHandDevicePhotos(user.id, photoUris);

        if (!up.ok) {
          imageUrls = editingDeviceId
            ? photoUris.filter(
                (u) => u.startsWith("http://") || u.startsWith("https://")
              )
            : [];
        } else {
          imageUrls = up.imageUrls;
        }
      }

      const result = await saveSecondHandDevice({
        deviceId: editingDeviceId,
        shared,
        phone,
        tablet,
        computer,
        watch,
        console: consoleForm,
        imageUrls,
      });

      if (!result.ok) {
        return { success: false, error: result.error };
      }

      setEditingDeviceId(null);
      resetAll();
      await fetchDevices();
      return { success: true };
    } finally {
      setSaving(false);
    }
  }, [
    shared,
    phone,
    tablet,
    computer,
    watch,
    consoleForm,
    editingDeviceId,
    resetAll,
    fetchDevices,
  ]);

  const updateWebPublishing = useCallback(
    async (
      deviceId: string,
      patch: WebPublishingPatch
    ): Promise<{ success: boolean; error?: string }> => {
      const result = await updateSecondHandDeviceWebPublishing(deviceId, patch);
      if (!result.ok) {
        return { success: false, error: result.error };
      }

      setDevices((prev) =>
        prev.map((d) => {
          if (d.id !== deviceId) return d;
          return {
            ...d,
            web_published: patch.web_published,
            ...("web_title" in patch
              ? { web_title: patch.web_title ?? null }
              : {}),
            ...("web_description" in patch
              ? { web_description: patch.web_description ?? null }
              : {}),
          };
        })
      );

      return { success: true };
    },
    []
  );

  const markSold = useCallback(
    async (id: string): Promise<boolean> => {
      const result = await markSecondHandDeviceSold(id);
      if (!result.ok) return false;
      setDevices((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, status: "sold", web_published: false } : d
        )
      );
      return true;
    },
    []
  );

  const removeDevice = useCallback(async (id: string): Promise<boolean> => {
    const result = await deleteSecondHandDevice(id);
    if (!result.ok) return false;
    setDevices((prev) => prev.filter((d) => d.id !== id));
    if (editingDeviceId === id) {
      setEditingDeviceId(null);
      resetAll();
    }
    return true;
  }, [editingDeviceId, resetAll]);

  const startEditDevice = useCallback(
    (device: IkinciElCihaz) => {
      setEditingDeviceId(device.id);
      hydrateFromDevice(device as DeviceRowForHydrate);
    },
    [hydrateFromDevice]
  );

  const cancelEditDevice = useCallback(() => {
    setEditingDeviceId(null);
    resetAll();
  }, [resetAll]);

  return {
    devices,
    loading,
    saving,
    shared,
    phone,
    tablet,
    computer,
    watch,
    console: consoleForm,
    updateShared,
    updatePhone,
    updateTablet,
    updateComputer,
    updateWatch,
    updateConsole,
    setDeviceCategory,
    setListingType,
    resetAll,
    fetchDevices,
    saveDevice,
    updateWebPublishing,
    markSold,
    removeDevice,
    editingDeviceId,
    startEditDevice,
    cancelEditDevice,
  };
}
