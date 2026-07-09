import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "./notificationService.js";
import { jsonResponse } from "../test/mockFetch.js";

describe("notificationService", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("getNotifications arma query de no leídas y límite", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));

    await getNotifications("token", { unreadOnly: true, limit: 5 });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/unread=true.*limit=5|limit=5.*unread=true/),
      expect.any(Object),
    );
  });

  it("getUnreadNotificationCount consulta contador", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ count: 3 }));

    const result = await getUnreadNotificationCount("token");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/notifications/unread-count"),
      expect.any(Object),
    );
    expect(result.count).toBe(3);
  });

  it("markNotificationAsRead hace PUT por id", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ ok: true }));

    await markNotificationAsRead("n1", "token");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/notifications/n1/read"),
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("markAllNotificationsAsRead marca todas", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ ok: true }));

    await markAllNotificationsAsRead("token");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/notifications/read-all"),
      expect.objectContaining({ method: "PUT" }),
    );
  });
});
