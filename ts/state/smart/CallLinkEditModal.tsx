// Copyright 2024 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only
import React, { memo, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { CallLinkEditModal } from '../../components/CallLinkEditModal';
import { useCallingActions } from '../ducks/calling';
import { getCallLinkSelector } from '../selectors/calling';
import * as log from '../../logging/log';
import { getIntl } from '../selectors/user';
import { useGlobalModalActions } from '../ducks/globalModals';
import type { CallLinkRestrictions } from '../../types/CallLink';
import { getCallLinkEditModalRoomId } from '../selectors/globalModals';
import { strictAssert } from '../../util/assert';
import { linkCallRoute } from '../../util/signalRoutes';
import { copyCallLink } from '../../util/copyLinksWithToast';
import { drop } from '../../util/drop';
import { isCallLinksCreateEnabled } from '../../util/callLinks';

export const SmartCallLinkEditModal = memo(
  function SmartCallLinkEditModal(): JSX.Element | null {
    strictAssert(isCallLinksCreateEnabled(), 'Call links creation is disabled');

    const roomId = useSelector(getCallLinkEditModalRoomId);
    strictAssert(roomId, 'Expected roomId to be set');

    const i18n = useSelector(getIntl);
    const callLinkSelector = useSelector(getCallLinkSelector);

    const {
      updateCallLinkName,
      updateCallLinkRestrictions,
      startCallLinkLobby,
    } = useCallingActions();
    const { toggleCallLinkEditModal, showShareCallLinkViaSignal } =
      useGlobalModalActions();

    const callLink = useMemo(() => {
      return callLinkSelector(roomId);
    }, [callLinkSelector, roomId]);

    const handleClose = useCallback(() => {
      toggleCallLinkEditModal(null);
    }, [toggleCallLinkEditModal]);

    const handleCopyCallLink = useCallback(() => {
      strictAssert(callLink != null, 'callLink not found');
      const callLinkWebUrl = linkCallRoute
        .toWebUrl({
          key: callLink?.rootKey,
        })
        .toString();
      drop(copyCallLink(callLinkWebUrl));
    }, [callLink]);

    const handleUpdateCallLinkName = useCallback(
      (newName: string) => {
        updateCallLinkName(roomId, newName);
      },
      [roomId, updateCallLinkName]
    );

    const handleUpdateCallLinkRestrictions = useCallback(
      (newRestrictions: CallLinkRestrictions) => {
        updateCallLinkRestrictions(roomId, newRestrictions);
      },
      [roomId, updateCallLinkRestrictions]
    );

    const handleShareCallLinkViaSignal = useCallback(() => {
      strictAssert(callLink != null, 'callLink not found');
      showShareCallLinkViaSignal(callLink, i18n);
    }, [callLink, i18n, showShareCallLinkViaSignal]);

    const handleStartCallLinkLobby = useCallback(() => {
      strictAssert(callLink != null, 'callLink not found');
      startCallLinkLobby({ rootKey: callLink.rootKey });
      toggleCallLinkEditModal(null);
    }, [callLink, startCallLinkLobby, toggleCallLinkEditModal]);

    if (!callLink) {
      log.error(
        'SmartCallLinkEditModal: No call link found for roomId',
        roomId
      );
      return null;
    }

    return (
      <CallLinkEditModal
        i18n={i18n}
        callLink={callLink}
        onClose={handleClose}
        onCopyCallLink={handleCopyCallLink}
        onUpdateCallLinkName={handleUpdateCallLinkName}
        onUpdateCallLinkRestrictions={handleUpdateCallLinkRestrictions}
        onShareCallLinkViaSignal={handleShareCallLinkViaSignal}
        onStartCallLinkLobby={handleStartCallLinkLobby}
      />
    );
  }
);
